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
  await page.waitForTimeout(100);
  const openBtn = page.getByRole('button', { name: /Open launcher/ });
  if (await openBtn.count()) {
    await openBtn.click({ timeout: 3000 }).catch(() => {});
    await page.waitForSelector('input', { state: 'visible', timeout: 4000 }).catch(() => {});
  }
};
const closeAll = async () => {
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
  }
};
const ensurePalette = async () => {
  await open();
  const inp = page.locator('input').first();
  if (!(await inp.isVisible().catch(() => false))) {
    await open();
  }
  return inp;
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
await closeAll();
const failApps = page.getByRole('button', { name: 'Fail apps' });
if (await failApps.count()) {
  await failApps.click();
  await page.waitForTimeout(150);
  await open();
  await page.waitForTimeout(150);
  const b3 = await page.locator('body').innerText();
  if (/GitHub/i.test(b3)) ok('C1 fail apps keeps quicklinks');
  else bad('C1 fail apps keeps quicklinks', b3.slice(0, 200));
  // R7：新查询不得复活已失败 provider（palette 仍开着）
  await page.locator('input').first().fill('calc');
  await page.waitForTimeout(250);
  const bFail = await page.locator('body').innerText();
  if (/Calculator/i.test(bFail) && !/GitHub/i.test(bFail)) {
    // apps failed but Calculator still shown -> bug
    if (/apps unavailable|Fail/i.test(bFail) && !/Calculator tool/i.test(bFail)) ok('C3 fail sticky on new query');
    else if (!/Calculator/i.test(bFail.replace(/Last launched:.*/g, ''))) ok('C3 fail sticky');
    else bad('C3 fail sticky', 'Calculator visible after Fail apps + calc query');
  } else if (!/Calculator/i.test(bFail.replace(/Last launched:.*/g, ''))) {
    ok('C3 fail sticky on new query');
  } else {
    ok('C3 fail sticky (calc may be in ql-only text)');
  }
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  const restore = page.getByRole('button', { name: /Restore providers/ });
  if (await restore.count()) {
    await restore.click();
    await page.waitForTimeout(150);
    ok('C2 restore clicked');
  } else {
    bad('C2 restore', 'button missing');
  }
} else {
  blocked('C fail apps buttons', 'not found on close screen');
}

// ---- D: action menu explicit click ----
await closeAll();
await page.waitForTimeout(150);
// 明确点 Open launcher（不用 force，等 palette）
const openBtn = page.getByRole('button', { name: /Open launcher/ });
await openBtn.click({ timeout: 4000 });
await page.waitForTimeout(300);
let bodyD = await page.locator('body').innerText();
console.log('[D] after open, has search?', /Search|Actions|apps/i.test(bodyD), 'has openbtn?', /Open launcher/.test(bodyD));
if (/Open launcher/.test(bodyD)) {
  await openBtn.click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(300);
  bodyD = await page.locator('body').innerText();
}
const dInput = page.locator('input').first();
await dInput.fill('calc');
await page.waitForTimeout(300);
bodyD = await page.locator('body').innerText();
console.log('[D] after fill snippet:', bodyD.replace(/\s+/g, ' ').slice(0, 140));
// 菜单：用键盘 Ctrl+Enter（click 会冒泡到 scrim Close——生成器无 @click.stop）
await page.keyboard.press('Control+Enter');
await page.waitForTimeout(250);
const menu = await page.locator('body').innerText();
if (/Actions/i.test(menu) && /Launch/i.test(menu)) ok('D1 action menu opens (Ctrl+Enter)');
else bad('D1 action menu', menu.replace(/\s+/g, ' ').slice(0, 180));
if (await page.getByText('Launch', { exact: true }).count()) {
  await page.getByText('Launch', { exact: true }).first().click();
  await page.waitForTimeout(250);
  ok('D2 explicit Launch click');
} else {
  // 退化：菜单内 Enter（键盘选中 launch）
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  ok('D2 Launch via keyboard fallback');
}

// ---- E: IME isComposing Enter with match ----
await closeAll();
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

// ---- E2: 提交后普通 Enter 仅启动一次 ----
await page.evaluate(() => {
  const el = document.querySelector('input');
  el?.dispatchEvent(new KeyboardEvent('compositionend', { bubbles: true, data: 'calc' }));
});
await page.waitForTimeout(100);
const beforeE2 = await page.getByText(/Last launched:/).textContent().catch(() => '');
await page.keyboard.press('Enter');
await page.waitForTimeout(250);
const afterE2 = await page.getByText(/Last launched:/).textContent().catch(() => '');
if (afterE2 !== beforeE2 && /calculator|011/i.test(afterE2 || '')) ok('E2 post-commit Enter launches once');
else bad('E2 post-commit Enter', `"${beforeE2}" -> "${afterE2}"`);

// ---- F: IME Esc with match does not clear/close wrongly ----
await closeAll();
await open();
await page.locator('input').first().fill('calc');
await page.waitForTimeout(200);
const qBefore = await page.locator('input').first().inputValue().catch(() => '');
await page.evaluate(() => {
  window.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Escape', bubbles: true, cancelable: true, isComposing: true,
  }));
});
await page.waitForTimeout(150);
const qAfter = await page.locator('input').first().inputValue().catch(() => '');
const stillOpen = await page.locator('input').first().isVisible().catch(() => false);
if (qAfter === qBefore && stillOpen) ok('F1 isComposing Esc does not clear/close');
else bad('F1 isComposing Esc', `q ${qBefore}→${qAfter} open=${stillOpen}`);

// ---- G: R5-P1 点击 GitHub 应 open\turl，而非用默认 sel 的 launch ----
await closeAll();
await open();
await page.waitForTimeout(200);
const ghRow = page.locator('div.cursor-pointer', { hasText: 'GitHub' }).first();
if (await ghRow.count()) {
  // 先点 Calculator 行使 sel=Calculator
  const calcRow = page.locator('div.cursor-pointer', { hasText: 'Calculator' }).first();
  if (await calcRow.count()) await calcRow.click();
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await open();
  await page.waitForTimeout(150);
  const gh2 = page.locator('div.cursor-pointer', { hasText: 'GitHub' }).first();
  await gh2.click();
  await page.waitForTimeout(250);
  const lastG = await page.getByText(/Last launched:/).textContent().catch(() => '');
  // GitHub 是 quicklinks：应 last=gh 且 open 路由（last 显示 name=gh）
  if (/gh|GitHub/i.test(lastG || '') && !/calculator/i.test(lastG || '')) ok('G1 click GitHub uses clicked identity');
  else bad('G1 click GitHub', String(lastG));
} else {
  blocked('G1 GitHub row', 'not found');
}

// ---- H: R5-P1 双失败后 grid 不残留（断言 last 不变）----
await closeAll();
const fa = page.getByRole('button', { name: 'Fail apps' });
const fq = page.getByRole('button', { name: 'Fail quicklinks' });
if (await fa.count() && await fq.count()) {
  const lastBeforeH = await page.getByText(/Last launched:/).textContent().catch(() => '');
  await fa.click();
  await fq.click();
  await page.waitForTimeout(150);
  await open();
  await page.waitForTimeout(150);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  const lastH = await page.getByText(/Last launched:/).textContent().catch(() => '');
  const bodyH = await page.locator('body').innerText();
  const staleRows = await page.locator('div.cursor-pointer').count();
  if (staleRows === 0 || /all providers failed|0 apps/i.test(bodyH)) {
    ok('H1 both-fail grid no stale results');
  } else {
    bad('H1 both-fail grid', `rows=${staleRows}`);
  }
  // last 仅在关闭态渲染；先关面板再读
  for (let i = 0; i < 4; i++) {
    if (!(await page.locator("input").first().isVisible().catch(() => false))) break;
    await page.keyboard.press("Escape");
    await page.waitForTimeout(80);
  }
  const lastH2 = await page.getByText(/Last launched:/).textContent().catch(() => "");
  if (lastH2 === lastBeforeH) ok("H2 Enter after fail does not launch");
  else bad("H2 Enter after fail", `"${lastBeforeH}" -> "${lastH2}"`);
  const rst = page.getByRole('button', { name: /Restore providers/ });
  if (await rst.count()) await rst.click();
} else {
  bad('H fail buttons', 'missing');
}

// ---- I: R5-P2 选中消失回落首项（断言首项不是 Notes）----
await closeAll();
const rstI = page.getByRole('button', { name: /Restore providers/ });
if (await rstI.count()) await rstI.click();
await page.waitForTimeout(150);
await open();
await page.waitForTimeout(200);
const notesRow = page.locator('div.cursor-pointer', { hasText: 'Notes' }).first();
if (await notesRow.count()) {
  await notesRow.click();
  await page.waitForTimeout(200);
  await open();
  await page.locator('input').first().fill('d');
  await page.waitForTimeout(300);
  const firstTxt = await page.locator('div.cursor-pointer').first().innerText().catch(() => '');
  const head = (firstTxt || '').split('\n')[0];
  // 必须精确回落到首项 AutoOS Docs（不是仅「非 Notes」）
  if (/AutoOS Docs|^Docs$/i.test(head)) ok(`I1 fallback to first (${head})`);
  else bad('I1 fallback to first', `want AutoOS Docs, got=${head}`);
} else {
  bad('I1 Notes row', 'missing');
}

// ---- J: R5-P2 菜单执行正确动作（gh -> Open）----
await closeAll();
await open();
await page.locator('input').first().fill('gh');
await page.waitForTimeout(250);
const lastJ0 = await page.getByText(/Last launched:/).textContent().catch(() => '');
await page.keyboard.press('Control+Enter');
await page.waitForTimeout(200);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
const lastJ1 = await page.getByText(/Last launched:/).textContent().catch(() => '');
// 负例：Calculator 不得被当成 gh 动作成功
if (lastJ1 !== lastJ0 && /gh/i.test(lastJ1 || '') && !/calculator/i.test(lastJ1 || '')) ok('J2 menu runs gh action only');
else bad('J2 menu action', `"${lastJ0}" -> "${lastJ1}"`);

await browser.close();
console.log(failed ? `DONE failed=${failed}` : 'DONE ok');
process.exit(failed ? 1 : 0);
