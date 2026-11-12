import { mkdir, mkdtemp, readdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PATH || './tools/node_modules/playwright');
const axe = require.resolve('./tools/node_modules/axe-core/axe.min.js');
const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ executablePath, headless: true });
const base = 'http://127.0.0.1:8765';
const failures = [], errors = [], lowContrast = new Map(), smallText = new Map();
const record = (name, condition) => { if (!condition) failures.push(name); };
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const pages = (await readdir('dist', { recursive: true })).filter(name => name.endsWith('index.html'));
  await mkdir('qa/after', { recursive: true });
  async function measure(route) {
    const data = await page.evaluate(() => {
      function luminance(colour) {
        const channels = colour.map(n => { const v = n / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; });
        return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
      }
      const issues = [], tiny = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const node = walker.currentNode, text = node.textContent.trim(), el = node.parentElement;
        if (!text || el.closest('[aria-hidden=true], .visually-hidden, caption, script, option') || el.getClientRects().length === 0) continue;
        const style = getComputedStyle(el);
        if (style.visibility !== 'visible') continue;
        const selector = el.className || el.tagName;
        if (parseFloat(style.fontSize) < 11) tiny.push({ text: text.slice(0, 44), selector, size: style.fontSize });
        let parent = el, bg;
        if (el.closest('.fee-switch label:has(:checked)')) bg = [23, 47, 36];
        while (parent && !bg) {
          const colour = getComputedStyle(parent).backgroundColor;
          if (colour.startsWith('rgb(')) { bg = colour.match(/[\d.]+/g).map(Number); break; }
          parent = parent.parentElement;
        }
        const fg = style.color.match(/[\d.]+/g)?.map(Number);
        if (!fg || !bg || fg.length !== 3) continue;
        const lums = [luminance(fg), luminance(bg)].sort((a,b) => b-a);
        const ratio = (lums[0] + .05) / (lums[1] + .05);
        if (ratio < 4.5) issues.push({ text: text.slice(0, 52), selector, colour: style.color, background: bg.join(','), ratio: +ratio.toFixed(2) });
      }
      return { overflow: document.documentElement.scrollWidth > innerWidth, issues, tiny };
    });
    record(route + ' overflow', !data.overflow);
    for (const item of data.issues) lowContrast.set(item.colour + '|' + item.background + '|' + item.selector, item);
    for (const item of data.tiny) smallText.set(item.selector + item.size, item);
  }
  for (const file of pages) {
    const route = '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '');
    await page.goto(base + route);
    await measure(route);
    await page.addScriptTag({ path: axe });
    const axeResult = await page.evaluate(async () => await axe.run());
    results.push({ route, violations: axeResult.violations.map(({ id, impact, nodes }) => ({ id, impact, targets: nodes.map(node => node.target) })) });
  }
  for (const width of [320, 360, 390, 414, 768, 1024, 1280, 1536, 1920]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await measure('Home at ' + width);
    await page.screenshot({ path: 'qa/after/home-' + width + '.png' });
  }
  // Use native browser zoom in an isolated profile, including the viewport reflow.
  const profile = await mkdtemp(join(tmpdir(), 'century-zoom-'));
  await mkdir(join(profile, 'Default'));
  await writeFile(join(profile, 'Default', 'Preferences'), JSON.stringify({
    partition: { default_zoom_level: { x: Math.log(2) / Math.log(1.2) } },
  }));
  const zoomed = await chromium.launchPersistentContext(profile, {
    executablePath, headless: true, viewport: null, args: ['--window-size=656,960', '--force-device-scale-factor=1'],
  });
  try {
    const reflow = zoomed.pages()[0];
    for (const file of pages) {
      const route = '/' + file.replaceAll('\\', '/').replace(/index\.html$/, '');
      await reflow.goto(base + route);
      record(route + ' 200% reflow', await reflow.evaluate(() => {
        return devicePixelRatio === 2 && document.documentElement.scrollWidth <= innerWidth;
      }));
    }
  } finally {
    await zoomed.close();
  }
  const touch = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  touch.on('pageerror', error => errors.push(error.message));
  const requests = [];
  touch.on('request', request => requests.push(request.url()));
  await touch.goto(base);
  await touch.keyboard.press('Tab');
  assert.equal(await touch.locator(':focus').textContent(), 'Skip to content');
  assert.equal(requests.some(url => url.endsWith('/course-data.mjs')), false);
  await touch.getByRole('button', { name: 'Menu' }).tap();
  assert.equal(await touch.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded'), 'true');
  await touch.keyboard.press('Escape');
  assert.equal(await touch.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded'), 'false');
  assert.equal(await touch.locator(':focus').getAttribute('class'), 'menu-toggle');
  await touch.getByRole('button', { name: 'Menu' }).tap();
  await touch.touchscreen.tap(200, 650);
  assert.equal(await touch.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded'), 'false');
  await touch.getByRole('button', { name: 'Menu' }).tap();
  await touch.locator('#main-nav').getByText('Fees', { exact: true }).tap();
  assert.equal(await touch.getByRole('button', { name: 'Menu' }).getAttribute('aria-expanded'), 'false');
  await touch.locator('.fee-switch input:checked').focus();
  await touch.keyboard.press('ArrowRight');
  assert.equal(await touch.locator('#fees-monthly').isVisible(), true);
  assert.equal(await touch.locator('#fees-hourly').isVisible(), false);
  await touch.locator('.faq-list summary').first().tap();
  assert.equal(await touch.locator('.faq-list details[open]').count(), 1);
  await touch.locator('.finder summary').tap();
  const firstLevel = touch.locator('#course-finder input[value="igcse"]');
  await firstLevel.waitFor({ state: 'visible' });
  await firstLevel.press('Space');
  assert.equal(await firstLevel.isChecked(), true);
  await touch.keyboard.press('ArrowRight');
  assert.equal(await touch.locator('#course-finder input[value="o-level"]').isChecked(), true);
  await touch.getByRole('button', { name: 'Continue' }).tap();
  await touch.locator('.choice').filter({ hasText: 'English Literature' }).filter({ visible: true }).tap();
  await touch.getByRole('button', { name: 'Continue' }).tap();
  await touch.locator('.choice').filter({ hasText: '2028' }).tap();
  await touch.getByRole('button', { name: 'Show my course' }).tap();
  assert.match(await touch.locator('#finder-result').innerText(), /2010/);
  assert.match(await touch.locator('#finder-papers').innerText(), /Drama and Unseen/);
  await touch.locator('#finder-result').getByRole('link', { name: 'View course guide' }).tap();
  assert.equal(await touch.locator('#exam-year').inputValue(), '2028');
  assert.match(await touch.locator('#official-source').getAttribute('href'), /743325/);
  await touch.locator('#exam-year').selectOption('2027');
  assert.match(await touch.locator('#official-source').getAttribute('href'), /721418/);
  for (const code of ['0500','0475','1123','2010','9093','9695']) {
    await touch.goto(base + '/contact/?course=' + code + '&year=2028');
    assert.equal(await touch.locator('#contact-course').inputValue(), code);
    assert.equal(await touch.locator('#contact-year').inputValue(), '2028');
  }
  await touch.getByRole('button', { name: 'Prepare my message' }).tap();
  assert.match(await touch.locator('#copy-status').innerText(), /Nothing has been sent/);
  assert.equal(await touch.getByRole('link', { name: 'Open Instagram' }).isVisible(), true);
  await touch.goto(base + '/#fees');
  await touch.locator('.mobile-trial').waitFor({ state: 'visible' });
  await touch.locator('footer').scrollIntoViewIfNeeded();
  await touch.locator('.mobile-trial').waitFor({ state: 'hidden' });
  assert.equal(await touch.evaluate(() => getComputedStyle(document.querySelector('.hero-copy h1')).animationName), 'none');
} catch (error) {
  failures.push(error.stack);
} finally {
  await browser.close();
  const report = { failures, errors: [...new Set(errors)], lowContrast: [...lowContrast.values()], smallText: [...smallText.values()], axe: results };
  await writeFile('qa/browser-report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ failures, errors: report.errors, contrast: report.lowContrast.length, smallText: report.smallText.length, axePages: results.length, violations: results.filter(result => result.violations.length) }, null, 2));
  if (failures.length || errors.length || report.lowContrast.length || report.smallText.length || results.some(result => result.violations.some(v => ['serious','critical'].includes(v.impact)))) process.exitCode = 1;
}
