#!/usr/bin/env node
/**
 * LAUNCHER-001 Phase2 T-11 / AC-01–12 Vue 驱动（生产 UI 路径）。
 *
 * 用法（先 `auto run`，端口 17842）：
 *   node tests/drive_phase2.mjs [baseURL]
 *
 * 覆盖：
 *  A. 有匹配查询的排名/身份（"calc" → Calculator 优先；Enter 启动正确实体）
 *  B. 双 provider 结果出现（GitHub 等 quicklinks）
 *  C. Fail apps 后仍见 quicklinks；Restore 后恢复
 *  D. Ctrl+Enter 菜单 Launch/Open 显式点击
 *  E. IME：有匹配结果时 isComposing Enter 不启动
 *
 * 缺 Playwright / 服务未起 → exit 2（P2-R06：BLOCKED 非成功）。
 */
import { pathToFileURL } from 'url';

const base = process.argv.find((a) => a.startsWith('http')) || 'http://localhost:17842';

async function resolvePlaywright() {
  const paths = [
    'd:/autostack/auto-lang/packages/auto-forge-ui/node_modules/playwright/index.mjs',
    'd:/autostack/auto-os-config/node_modules/playwright/index.mjs',
    'playwright',
  ];
  for (const p of paths) {
    try {
      return await import(pathToFileURL(p).href);
    } catch (_) {}
  }
  return null;
}

let failed = 0;
const ok = (m) => console.log('PASS ', m);
const bad = (m, d) => { console.log('FAIL ', m, '—', d); failed++; };
const blocked = (m, d) => { console.log('BLOCKED ', m, '—', d); failed++; };

const pw = await resolvePlaywright();
if (!pw) {
  console.error('BLOCKED: Playwright missing');
  process.exit(2);
}

const browser = await pw.chromium.launch({ headless: true, channel: 'msedge' })
  .catch(() => pw.chromium.launch({ headless: true }));
if (!browser) {
  blocked('browser', 'launch failed');
  process.exit(2);
}
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();

try {
  await page.goto(base, { waitUntil: 'networkidle', timeout: 15000 });
} catch (e) {
  blocked('goto', String(e));
  await browser.close();
  process.exit(2);
}

const open = async () => {
  await page.getByRole('button', { name: /Open launcher/ }).click();
  await page.waitForSelector('input', { state: 'visible', timeout: 5000 });
};
const input = () => page.locator('input').first();

// ---- A: ranking + identity ----
await open();
await input().fill('calc');
await page.waitForTimeout(200);
const body = await page.locator('body').innerText();
if (/Calculator/i.test(body)) ok('A1 calc query shows Calculator');
else bad('A1 calc query shows Calculator', body.slice(0, 200));

await page.keyboard.press('Enter');
await page.waitForTimeout(250);
const last = await page.getByText(/Last launched:/).textContent().catch(() => '');
if (/calculator|011-calculator/i.test(last || '')) ok('A2 Enter launches Calculator identity');
else bad('A2 Enter launches Calculator', String(last));

// ---- B: quicklinks visible ----
await open();
await input().fill('');
await page.waitForTimeout(150);
const body2 = await page.locator('body').innerText();
if (/GitHub/i.test(body2)) ok('B1 quicklinks present (GitHub)');
else bad('B1 quicklinks present', body2.slice(0, 200));

// ---- C: fail apps → ql remains; restore ----
const failApps = page.getByRole('button', { name: 'Fail apps' });
if (await failApps.count()) {
  await failApps.click();
  await page.waitForTimeout(150);
  const b3 = await page.locator('body').innerText();
  if (/GitHub/i.test(b3)) ok('C1 fail apps keeps quicklinks');
  else bad('C1 fail apps keeps quicklinks', b3.slice(0, 200));
  const restore = page.getByRole('button', { name: /Restore providers/ });
  await restore.click();
  await page.waitForTimeout(150);
  ok('C2 restore clicked');
} else {
  blocked('C fail apps buttons', 'not found');
}

// ---- D: action menu explicit click ----
await open();
await input().fill('calc');
await page.waitForTimeout(200);
await page.keyboard.press('Control+Enter');
await page.waitForTimeout(150);
const menu = await page.locator('body').innerText();
if (/Actions/i.test(menu)) ok('D1 Ctrl+Enter opens action menu');
else bad('D1 action menu', menu.slice(0, 120));
const launchBtn = page.getByText('Launch', { exact: true }).first();
if (await launchBtn.count()) {
  await launchBtn.click();
  await page.waitForTimeout(200);
  ok('D2 explicit Launch click');
} else {
  bad('D2 Launch menu item', 'missing');
}

// ---- E: IME isComposing Enter with match ----
await open();
await input().fill('calc');
await page.waitForTimeout(150);
const before = await page.getByText(/Last launched:/).textContent().catch(() => '');
await page.evaluate(() => {
  const el = document.querySelector('input');
  el?.dispatchEvent(new KeyboardEvent('compositionstart', { bubbles: true }));
  window.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Enter', bubbles: true, cancelable: true, isComposing: true,
  }));
  el?.dispatchEvent(new KeyboardEvent('keyup', {
    key: 'Enter', bubbles: true, cancelable: true, isComposing: true,
  }));
  el?.dispatchEvent(new KeyboardEvent('compositionend', { bubbles: true, data: 'calc' }));
});
await page.waitForTimeout(200);
const after = await page.getByText(/Last launched:/).textContent().catch(() => '');
if (after === before) ok('E1 isComposing Enter with match does not launch');
else bad('E1 isComposing Enter', `"${before}" → "${after}"`);

await browser.close();
console.log(failed ? `DONE failed=${failed}` : 'DONE ok');
process.exit(failed ? 1 : 0);
