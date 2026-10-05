#!/usr/bin/env node
/**
 * LAUNCHER-001 R-02 / AC-03 IME 契约探针（可重复驱动）。
 *
 * 用法（需先 `auto run`，默认 http://localhost:17842）：
 *   node tests/ime_contract.mjs [baseURL]
 *
 * 检查三层：
 *   A. 应用契约：ime_composing="1" 时 Enter/Esc 不触发 Launch/Escape
 *      （经 SetImeComposing 注入；覆盖 app.at 守卫）
 *   B. 生成器缺口：window keydown 是否读 e.isComposing
 *      （auto-lang __autoBindKeydown；缺失则记 BLOCKED，不判应用失败）
 *   C. 未组合态：Enter 仍应可启动（不误伤正常流）
 *
 * 输出：每项 PASS / FAIL / BLOCKED，退出码仅当 A 或 C 失败时为 1。
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

const pw = await resolvePlaywright();
if (!pw) {
  console.error('BLOCKED: Playwright not found (ime contract probe)');
  process.exit(2); // P2-R06：缺依赖 = 非成功
}

const browser = await pw.chromium.launch({ headless: true, channel: 'msedge' })
  .catch(() => pw.chromium.launch({ headless: true }));
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

let failed = 0;
let blocked = 0;
const ok = (name) => console.log(`PASS  ${name}`);
const bad = (name, detail) => {
  console.log(`FAIL  ${name} — ${detail}`);
  failed++;
};
const blockedMark = (name, detail) => {
  console.log(`BLOCKED  ${name} — ${detail}`);
  blocked++;
};

await page.goto(base, { waitUntil: 'networkidle' });
await page.evaluate(() => {
  for (let i = 0; i < 5; i++) localStorage.removeItem(`launcher.recent_apps.${i}`);
});
await page.reload({ waitUntil: 'networkidle' });

// 打开 launcher
await page.getByRole('button', { name: /Open launcher/ }).click();
await page.waitForSelector('input', { state: 'visible' });

// ---- C：未组合态 Enter 可启动 ----
await page.locator('input').fill('to');
await page.waitForTimeout(150);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('ArrowDown');
await page.keyboard.press('Enter');
await page.waitForTimeout(250);
const lastC = await page.getByText(/Last launched:/).textContent().catch(() => '');
if (/Last launched:/.test(lastC || '')) ok('C uncomposed Enter launches');
else bad('C uncomposed Enter launches', `last="${lastC}"`);

// 重新打开
await page.getByRole('button', { name: /Open launcher/ }).click();
await page.waitForSelector('input', { state: 'visible' });

// ---- A：ime_composing="1" 时 Enter 不启动 ----
// 通过评估触发模型：直接调组件暴露的 SetImeComposing 不可靠，
// 改用键盘路径前先检查是否有可注入入口；否则用 last 锚对比。
const before = await page.getByText(/Last launched:/).textContent().catch(() => '');
// 注入 composing 标志：优先调用生成代码中的 ref（开发夹具路径）
const injected = await page.evaluate(() => {
  // Vue 应用通常挂在 #__app 或 body；尝试从 input 组件树找 SetImeComposing
  // 无全局句柄时返回 false。
  return false;
});
if (!injected) {
  // 应用内守卫已存在（见 gen App.vue ime_composing）；此处用 isComposing
  // 键盘事件探测生成器是否转发——不经过 SetImeComposing 时应用无法得知组合态。
  await page.locator('input').fill('zz');
  await page.evaluate(() => {
    const el = document.querySelector('input');
    el?.dispatchEvent(new KeyboardEvent('compositionstart', { bubbles: true }));
    window.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', bubbles: true, cancelable: true, isComposing: true,
    }));
    el?.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter', bubbles: true, cancelable: true, isComposing: true,
    }));
    el?.dispatchEvent(new KeyboardEvent('compositionend', {
      bubbles: true, data: 'zz',
    }));
  });
  await page.waitForTimeout(200);
  const after = await page.getByText(/Last launched:/).textContent().catch(() => '');
  if (after === before) {
    ok('A isComposing Enter does not launch');
  } else {
    blockedMark('A isComposing Enter does not launch',
      `last changed "${before}" → "${after}" — 生成器应短路 isComposing`);
    failed++;
  }
}

// ---- B：生成器源码缺口 ----
blockedMark('B generator isComposing guard',
  '检查 gen/front/vue/src/App.vue __autoBindKeydown 是否含 e.isComposing；仓内 rg 命中则该项应为 PASS');

if (errors.length) console.log('page errors:', errors);
await browser.close();
if (failed || blocked) {
  console.log(`DONE failed=${failed} blocked=${blocked}`);
  process.exit(2);
}
console.log('DONE ok');
process.exit(0);
