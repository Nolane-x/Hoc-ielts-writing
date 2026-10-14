import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const baseUrl = process.env.WMR_BASE_URL || 'http://127.0.0.1:4179';
const outputDir = process.env.WMR_SCREENSHOT_DIR || 'artifacts/ui-screenshots';
const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const version = packageJson.version;
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const screenshots = [];
const browserErrors = [];
const viewportChecks = [];
let failure = null;

function listenForErrors(page, label) {
  page.on('pageerror', error => browserErrors.push({ page: label, type: 'pageerror', message: error.message }));
  page.on('console', message => {
    if (message.type() === 'error') browserErrors.push({ page: label, type: 'console', message: message.text() });
  });
}

async function capture(page, name, options = {}) {
  const file = path.join(outputDir, name);
  await page.screenshot({ path: file, animations: 'disabled', ...options });
  screenshots.push({ file, page: name });
}

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  listenForErrors(page, 'desktop');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#workspace-title').waitFor({ state: 'visible', timeout: 20000 });
  await page.waitForFunction(() => document.querySelector('#task-select')?.options?.length > 0);

  const versionLabel = await page.locator('.version-line').innerText();
  assert.ok(versionLabel.includes(version), `UI version label "${versionLabel}" does not match package version ${version}`);
  assert.ok(await page.locator('#essay-editor').isVisible(), 'Essay editor should be visible.');
  assert.ok(await page.locator('#run-writing-agent').isVisible(), 'Writing Agent action should be visible.');
  assert.ok((await page.locator('#agent-practice-journal').count()) > 0, 'Practice journal mount point should exist.');
  await capture(page, '01-writing-workspace-desktop.png');

  await page.locator('#agent-workspace').scrollIntoViewIfNeeded();
  await capture(page, '02-writing-agent-desktop.png');

  await page.locator('#essay-editor').fill(
    'Many people believe that education should focus on practical skills. However, I believe that schools should balance practical knowledge with critical thinking because both help students make informed decisions.'
  );
  await page.locator('#local-check').click();
  await page.locator('#page-report.active').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await page.locator('#report-content .empty-report').count(), 0, 'Local check should produce a report without calling an AI provider.');
  const reportText = await page.locator('#report-content').innerText();
  assert.ok(reportText.length > 40, 'The local report should contain useful visible content.');
  await capture(page, '03-local-report-desktop.png');

  await page.locator('button.nav-item[data-page="learn"]').click();
  await page.locator('#learn-title').waitFor({ state: 'visible', timeout: 10000 });
  await capture(page, '04-learning-dashboard-desktop.png');

  await page.locator('button.nav-item[data-page="settings"]').click();
  await page.locator('#settings-title').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await page.locator('#external-allowed').isChecked(), false, 'Provider access must default to off in the visual smoke environment.');
  await capture(page, '05-settings-privacy-desktop.png');

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    reducedMotion: 'reduce'
  });
  const mobilePage = await mobileContext.newPage();
  listenForErrors(mobilePage, 'mobile');
  await mobilePage.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mobilePage.locator('#workspace-title').waitFor({ state: 'visible', timeout: 20000 });
  const geometry = await mobilePage.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth
  }));
  viewportChecks.push({ viewport: '390x844', ...geometry });
  assert.ok(geometry.documentWidth <= geometry.viewportWidth + 8,
    `Mobile layout has horizontal overflow: viewport=${geometry.viewportWidth}px document=${geometry.documentWidth}px`);
  await capture(mobilePage, '06-writing-workspace-mobile.png');

  await mobilePage.locator('#mobile-menu').click();
  await mobilePage.locator('#sidebar.mobile-open').waitFor({ state: 'visible', timeout: 5000 });
  await capture(mobilePage, '07-mobile-navigation-open.png');
  await mobilePage.locator('button.nav-item[data-page="learn"]').click();
  await mobilePage.locator('#learn-title').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await mobilePage.locator('#sidebar.mobile-open').count(), 0, 'Selecting a mobile page should close the navigation drawer.');

  assert.deepEqual(browserErrors, [], 'Browser console/runtime errors were detected.');
  await writeFile(path.join(outputDir, 'visual-smoke-manifest.json'), JSON.stringify({
    status: 'passed', version, baseUrl, browser: 'Chromium (Playwright)', screenshots, viewportChecks, browserErrors
  }, null, 2));
  process.stdout.write(`Visual smoke passed for WMR ${version}; captured ${screenshots.length} screenshots.\n`);
} catch (error) {
  failure = error;
  throw error;
} finally {
  await writeFile(path.join(outputDir, 'visual-smoke-manifest.json'), JSON.stringify({
    status: failure ? 'failed' : 'passed', version, baseUrl, screenshots, viewportChecks, browserErrors,
    failure: failure ? String(failure.stack || failure) : null
  }, null, 2));
  await browser.close();
}
