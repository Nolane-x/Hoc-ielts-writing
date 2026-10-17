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
  // Stub the local Web Speech API so headless CI can exercise real UI wiring without audio or network access.
  await context.addInitScript(() => {
    const mock = { utterances: [], cancels: 0, pauses: 0, resumes: 0 };
    class MockSpeechSynthesisUtterance {
      constructor(text) { this.text = text; this.lang = ''; this.rate = 1; this.pitch = 1; this.voice = null; }
    }
    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      value: MockSpeechSynthesisUtterance
    });
    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      value: {
        getVoices: () => [{ name: 'Mock British English', lang: 'en-GB' }],
        cancel: () => { mock.cancels += 1; },
        pause: () => { mock.pauses += 1; },
        resume: () => { mock.resumes += 1; },
        speak: utterance => {
          mock.utterances.push({ text: utterance.text, lang: utterance.lang, rate: utterance.rate });
        }
      }
    });
    Object.defineProperty(window, '__wmrSpeechMock', { configurable: false, value: mock });
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
  assert.ok(await page.locator('#speech-reader-panel').isVisible(), 'The full read-aloud studio must be visible in the writing workspace.');
  for (const mode of ['essay', 'prompt', 'selection', 'feedback']) {
    assert.equal(await page.locator('[data-speech-read="' + mode + '"]').count(), 1, 'Missing read-aloud action for ' + mode);
  }

  await page.locator('#essay-editor').fill('The first draft is useful, but reading it aloud helps me find awkward phrases and improve my IELTS writing.');
  await page.locator('[data-speech-read="essay"]').click();
  await page.waitForFunction(() => document.querySelector('#speech-reader-status')?.dataset.state === 'speaking');
  await page.locator('#speech-reader-pause').click();
  await page.waitForFunction(() => document.querySelector('#speech-reader-status')?.dataset.state === 'paused');
  await page.locator('#speech-reader-resume').click();
  await page.waitForFunction(() => document.querySelector('#speech-reader-status')?.dataset.state === 'speaking');
  await page.locator('#speech-reader-stop').click();
  await page.waitForFunction(() => document.querySelector('#speech-reader-status')?.dataset.state === 'stopped');
  const speechEvidence = await page.evaluate(() => window.__wmrSpeechMock);
  assert.ok(speechEvidence.utterances.some(item => item.text.includes('reading it aloud')), 'Clicking read-aloud should call the local speech API with the essay text.');
  assert.equal(speechEvidence.utterances[0].lang, 'en-GB', 'Auto-detect should select British English for an English essay.');
  assert.ok(speechEvidence.pauses > 0 && speechEvidence.resumes > 0 && speechEvidence.cancels > 0,
    'Pause, resume and stop should call the speech API controls.');

  await page.locator('#essay-editor').evaluate(editor => {
    editor.focus();
    editor.setSelectionRange(0, 25);
  });
  await page.locator('[data-speech-read="selection"]').click();
  await page.waitForFunction(() => document.querySelector('#speech-reader-status')?.dataset.state === 'speaking');
  let latestSpeech = await page.evaluate(() => window.__wmrSpeechMock.utterances.at(-1));
  assert.ok(latestSpeech.text.includes('The first draft'), 'Selected-text reading should speak only the current editor selection.');
  await page.locator('[data-speech-read="prompt"]').click();
  await page.waitForFunction(() => document.querySelector('#speech-reader-status')?.dataset.state === 'speaking');
  latestSpeech = await page.evaluate(() => window.__wmrSpeechMock.utterances.at(-1));
  const visiblePrompt = (await page.locator('#task-prompt').innerText()).replace(/\\s+/g, ' ').trim();
  assert.ok(latestSpeech.text.includes(visiblePrompt.slice(0, Math.min(30, visiblePrompt.length))),
    'Prompt reading should include the visible IELTS task.');

  const originalAgentMarkup = await page.locator('#agent-result').innerHTML();
  await page.locator('#agent-result').evaluate(element => { element.textContent = 'Mock feedback: develop your main reason with one specific example.'; });
  await page.locator('[data-speech-read="feedback"]').click();
  await page.waitForFunction(() => document.querySelector('#speech-reader-status')?.dataset.state === 'speaking');
  latestSpeech = await page.evaluate(() => window.__wmrSpeechMock.utterances.at(-1));
  assert.ok(latestSpeech.text.includes('Mock feedback'), 'Feedback reading should read the visible Agent feedback.');
  await page.locator('#agent-result').evaluate((element, markup) => { element.innerHTML = markup; }, originalAgentMarkup);

  await page.locator('#speech-reader-stop').click();
  await page.waitForFunction(() => document.querySelector('#speech-reader-status')?.dataset.state === 'stopped');
  await page.locator('#speech-reader-panel').scrollIntoViewIfNeeded();
  await capture(page, '01e-speech-reader-desktop.png');
  await page.locator('#essay-editor').fill('');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await capture(page, '01-writing-workspace-desktop.png');

  // Verify the extra AI action remains blocked until the existing provider-consent switch is enabled.
  await page.locator('#custom-task-panel > summary').click();
  await page.locator('#custom-task-title').fill('Smoke-test custom task');
  await page.locator('#custom-task-prompt').fill('Some people support this change while others disagree. Discuss both views and give your own opinion.');
  await page.locator('#custom-task-panel').scrollIntoViewIfNeeded();
  await capture(page, '01d-custom-task-builder-desktop.png');
  let coachRequests = 0;
  let taskGenerationRequests = 0;
  page.on('request', request => {
    if (request.url().endsWith('/api/coach')) coachRequests++;
    if (request.url().endsWith('/api/tasks/generate')) taskGenerationRequests++;
  });
  await page.locator('#generate-custom-task').click();
  await page.waitForFunction(() => document.querySelector('#toast')?.textContent.toLowerCase().includes('quyền gửi provider'));
  assert.equal(coachRequests, 0, 'Custom-task generation must not call Mentor while permission is off.');
  assert.equal(taskGenerationRequests, 0, 'Custom-task generation must not call the dedicated AI endpoint while permission is off.');
  assert.equal(await page.locator('#external-allowed').isChecked().catch(() => false), false);

  // Learner-created tasks are persisted locally and can be removed with a clear destructive confirmation.
  await page.locator('#custom-task-title').fill('Smoke-test custom task');
  await page.locator('#custom-task-prompt').fill('Some people support this change while others disagree. Discuss both views and give your own opinion.');
  await page.locator('#custom-task-goal').fill('Compare both positions and support a clear opinion with developed reasons.');
  await page.locator('#save-custom-task').click();
  const customOption = page.locator('#task-select option').filter({ hasText: 'Smoke-test custom task' });
  await customOption.waitFor({ state: 'attached', timeout: 5000 });
  const customId = await customOption.getAttribute('value');
  assert.ok(customId?.startsWith('custom-'), 'Custom task needs a namespaced local identifier.');
  await page.locator('#essay-editor').fill('This is a local smoke-test draft for a custom writing task.');
  await page.waitForTimeout(350);
  await page.locator('#custom-task-panel > summary').click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('[data-delete-custom-task="' + customId + '"]').click();
  await page.waitForFunction(id => ![...document.querySelector('#task-select').options].some(option => option.value === id), customId);
  assert.equal(await page.evaluate(id => localStorage.getItem('wmr-draft-v1:' + id), customId), null,
    'Deleting a custom task should transactionally remove its local draft.');
  assert.equal(coachRequests, 0, 'Custom task CRUD must not call Mentor or the external provider.');
  assert.equal(taskGenerationRequests, 0, 'Custom task CRUD must not call the dedicated AI endpoint.');

  const manualAgentObjective = 'Keep my own manual Agent instruction intact.';
  await page.locator('#agent-task-input').fill(manualAgentObjective);
  await page.locator('#proactive-review-toggle').check();
  assert.equal(await page.locator('#agent-task-input').inputValue(), manualAgentObjective,
    'Enabling proactive review must not overwrite the learner-authored Agent objective.');
  await page.locator('#proactive-review-toggle').uncheck();

  await page.locator('#toggle-idea-lab').click();
  await page.locator('#idea-lab').waitFor({ state: 'visible', timeout: 5000 });
  await capture(page, '01b-academy-idea-lab-desktop.png');
  await page.locator('#toggle-idea-lab').click();

  await page.locator('#exam-mode-toggle').click();
  await page.locator('#app-shell.idp-bc-mode').waitFor({ state: 'visible', timeout: 5000 });
  const practiceGeometry = await page.evaluate(() => {
    const prompt = document.querySelector('#prompt-card')?.getBoundingClientRect();
    const editor = document.querySelector('.canvas-paper-frame')?.getBoundingClientRect();
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
  await page.locator('#local-check').click();
  await page.locator('#page-report.active').waitFor({ state: 'visible', timeout: 10000 });
  assert.equal(await page.locator('#report-content .empty-report').count(), 0, 'Local check should produce a report without calling an AI provider.');
  const reportText = await page.locator('#report-content').innerText();
  assert.ok(reportText.length > 40, 'The local report should contain useful visible content.');
  assert.match(reportText, /mẫu diễn đạt minh họa/i);
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
