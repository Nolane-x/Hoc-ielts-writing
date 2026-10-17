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
  // Let transient toast notifications disappear before capturing review evidence.
  await page.locator('#toast.visible').waitFor({ state: 'hidden', timeout: 4500 }).catch(() => {});
  await page.screenshot({ path: file, animations: 'disabled', ...options });
  screenshots.push({ file, page: name });
}

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    reducedMotion: 'reduce'
  });
  const page = await context.newPage();
  await context.addInitScript(() => {
    const calls = [];
    Object.defineProperty(window, '__wmrSpeechCalls', { value: calls, configurable: false });
    const synthesis = {
      pauseCount: 0,
      resumeCount: 0,
      cancelCount: 0,
      speak(utterance) { calls.push(utterance); },
      pause() { this.pauseCount += 1; },
      resume() { this.resumeCount += 1; },
      cancel() { this.cancelCount += 1; }
    };
    Object.defineProperty(window, 'speechSynthesis', { value: synthesis, configurable: true });
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      value: class MockSpeechSynthesisUtterance {
        constructor(text) { this.text = text; }
      },
      configurable: true
    });
  });
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

  await page.locator('#toggle-idea-lab').click();
  // Preserve state parity when restoring an existing draft can leave the panel
  // already expanded; the contract is that the control can reach the open state.
  const ideaLab = page.locator('#idea-lab');
  if (!(await ideaLab.isVisible())) await page.locator('#toggle-idea-lab').click();
  const ideaLabState = await page.evaluate(() => ({
    hidden: document.querySelector('#idea-lab')?.hidden,
    expanded: document.querySelector('#toggle-idea-lab')?.getAttribute('aria-expanded'),
    buttonText: document.querySelector('#toggle-idea-lab')?.textContent,
    toast: document.querySelector('#toast')?.textContent,
    appShellClasses: document.querySelector('#app-shell')?.className
  }));
  if (ideaLabState.hidden) {
    throw new Error('Idea Lab failed to open; inspect app initialization and click wiring: ' +
      JSON.stringify({ state: ideaLabState, browserErrors }));
  }
  await ideaLab.waitFor({ state: 'visible', timeout: 5000 });
  assert.equal(ideaLabState.expanded, 'true');
  await capture(page, '01b-academy-idea-lab-desktop.png');
  await page.locator('#toggle-idea-lab').click();

  await page.locator('#exam-mode-toggle').click();
  await page.locator('#app-shell.idp-bc-mode').waitFor({ state: 'visible', timeout: 5000 });
  const practiceGeometry = await page.evaluate(() => {
    const prompt = document.querySelector('#prompt-card')?.getBoundingClientRect();
    const editor = document.querySelector('.writing-canvas-column')?.getBoundingClientRect();
    return prompt && editor ? { promptTop: prompt.top, editorTop: editor.top, promptRight: prompt.right, editorLeft: editor.left } : null;
  });
  assert.ok(practiceGeometry, 'Practice mode must expose both prompt and writing canvas.');
  assert.ok(Math.abs(practiceGeometry.promptTop - practiceGeometry.editorTop) <= 80,
    `Prompt and editor should align in two columns; got ${JSON.stringify(practiceGeometry)}`);
  assert.ok(practiceGeometry.editorLeft > practiceGeometry.promptRight - 10,
    `Prompt and editor should remain side by side; got ${JSON.stringify(practiceGeometry)}`);
  await capture(page, '01c-exam-practice-desktop.png');
  await page.locator('#exam-mode-toggle').click();

  await page.locator('#agent-workspace').scrollIntoViewIfNeeded();
  await capture(page, '02-writing-agent-desktop.png');

  await page.locator('#essay-editor').fill(
    'Many people believe that education should focus on practical skills. However, I believe that schools should balance practical knowledge with critical thinking because both help students make informed decisions.'
  );

  // Assert the local read-aloud control drives the browser speech adapter.
  // The fake speech engine validates UI state transitions; it does not claim to
  // validate physical speakers, installed voices or real-world audio quality.
  await page.locator('#speech-read').click();
  await page.waitForFunction(() => window.__wmrSpeechCalls?.length > 0);
  const speechStart = await page.evaluate(() => ({
    text: window.__wmrSpeechCalls[0]?.text || '',
    language: window.__wmrSpeechCalls[0]?.lang || '',
    rate: window.__wmrSpeechCalls[0]?.rate
  }));
  assert.match(speechStart.text, /Many people believe that education should focus on practical skills/i,
    'Read-aloud should include the current learner draft.');
  assert.ok(['en-US', 'vi-VN'].includes(speechStart.language), 'Speech language should be an explicit supported locale.');
  assert.ok(speechStart.rate >= 0.7 && speechStart.rate <= 1.3, 'Speech rate should stay within the supported safe range.');

  await page.locator('#speech-pause').click();
  await page.waitForFunction(() => document.querySelector('#speech-status')?.textContent.includes('tạm dừng'));
  await page.locator('#speech-resume').click();
  await page.waitForFunction(() => document.querySelector('#speech-status')?.textContent.includes('tiếp tục'));
  await page.locator('#speech-stop').click();
  await page.waitForFunction(() => document.querySelector('#speech-status')?.textContent.includes('Đã dừng đọc'));
  const speechLifecycle = await page.evaluate(() => ({
    pauseCount: window.speechSynthesis.pauseCount,
    resumeCount: window.speechSynthesis.resumeCount,
    cancelCount: window.speechSynthesis.cancelCount
  }));
  assert.equal(speechLifecycle.pauseCount, 1, 'Pause should reach the local speech engine.');
  assert.equal(speechLifecycle.resumeCount, 1, 'Resume should reach the local speech engine.');
  assert.ok(speechLifecycle.cancelCount >= 2, 'Read/restart/stop should cancel any previous speech queue.');
  await capture(page, '01d-read-aloud-dock-desktop.png');

  await page.locator('#local-check').click();
  await page.locator('#page-report.active').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await page.locator('#report-content .empty-report').count(), 0, 'Local check should produce a report without calling an AI provider.');
  const reportText = await page.locator('#report-content').innerText();
  assert.ok(reportText.length > 40, 'The local report should contain useful visible content.');
  assert.match(reportText, /bài mẫu tham khảo|chưa hiệu chuẩn/i, 'Report should label model examples as uncalibrated learning material.');
  assert.doesNotMatch(reportText, /Bài mẫu Band 8\.5\+/i);
  await capture(page, '03-local-report-desktop.png');

  await page.locator('button.nav-item[data-page="learn"]').click();
  await page.locator('#learn-title').waitFor({ state: 'visible', timeout: 10000 });
  assert.ok(await page.locator('#mastery-radar-chart .radar-empty-note').count(), 'Learning must disclose missing eligible AI scores.');
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
  assert.ok(await mobilePage.locator('#exam-mode-toggle').isVisible(), 'Practice mode toggle must remain reachable on mobile.');
  assert.match(await mobilePage.locator('#exam-mode-toggle').getAttribute('aria-label'), /practice|luyện thi/i);
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

  await mobilePage.locator('#mobile-menu').click();
  await mobilePage.locator('#sidebar.mobile-open').waitFor({ state: 'visible', timeout: 5000 });
  await mobilePage.locator('button.nav-item[data-page="workspace"]').click();
  await mobilePage.locator('#workspace-title').waitFor({ state: 'visible', timeout: 10000 });
  await mobilePage.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await mobilePage.locator('#exam-mode-toggle').scrollIntoViewIfNeeded();
  await mobilePage.locator('#exam-mode-toggle').click();
  const mobilePractice = await mobilePage.evaluate(() => {
    const prompt = document.querySelector('#prompt-card')?.getBoundingClientRect();
    const editor = document.querySelector('.canvas-paper-frame')?.getBoundingClientRect();
    return {
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      promptTop: prompt?.top,
      editorTop: editor?.top
    };
  });
  viewportChecks.push({ viewport: '390x844-practice', ...mobilePractice });
  assert.ok(mobilePractice.documentWidth <= mobilePractice.viewportWidth + 8,
    `Mobile practice mode has horizontal overflow: ${JSON.stringify(mobilePractice)}`);
  assert.ok(mobilePractice.editorTop > mobilePractice.promptTop,
    `Practice mode should stack prompt before editor on narrow screens: ${JSON.stringify(mobilePractice)}`);
  await capture(mobilePage, '08-exam-practice-mobile.png');

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
