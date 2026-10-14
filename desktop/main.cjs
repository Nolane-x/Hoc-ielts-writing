const { app, BrowserWindow, utilityProcess } = require('electron');
const path = require('node:path');
const net = require('node:net');
const { randomBytes } = require('node:crypto');
const { createRuntimeEnvironment, isInternalNavigation } = require('./runtime-policy.cjs');

let runtime = null;
let mainWindow = null;
let port = null;
let baseUrl = null;
let startupToken = '';

if (!app.requestSingleInstanceLock()) app.quit();
else app.on('second-instance', () => {
  if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
});

async function reserveLoopbackPort() {
  const probe = net.createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolve);
  });
  const address = probe.address();
  const availablePort = typeof address === 'object' && address ? address.port : null;
  await new Promise((resolve, reject) => {
    probe.close(error => error ? reject(error) : resolve());
  });
  if (!Number.isInteger(availablePort) || availablePort < 1 || availablePort > 65535) {
    throw new Error('Could not reserve a loopback port for the local runtime.');
  }
  return availablePort;
}

async function waitForRuntime(url, token) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url + '/api/health', {
        headers: { 'x-wmr-startup-token': token },
        signal: AbortSignal.timeout(700),
        redirect: 'error',
        cache: 'no-store',
        credentials: 'omit'
      });
      if (response.ok) {
        const payload = await response.json();
        if (payload?.ok === true && payload?.mode === 'local-first') return;
      }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 180));
  }
  throw new Error('WMR local runtime did not pass its authenticated startup handshake.');
}

async function createWindow() {
  port = await reserveLoopbackPort();
  baseUrl = 'http://127.0.0.1:' + port;
  startupToken = randomBytes(32).toString('hex');
  runtime = utilityProcess.fork(path.join(app.getAppPath(), 'server/index.mjs'), [], {
    serviceName: 'WMR Local Runtime',
    stdio: 'pipe',
    env: createRuntimeEnvironment(process.env, app.getPath('userData'), port, startupToken)
  });
  runtime.on('exit', code => {
    if (code && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('wmr-runtime-error', 'Local runtime stopped. Restart WMR to continue.');
    }
  });
  await waitForRuntime(baseUrl, startupToken);
  startupToken = '';
  mainWindow = new BrowserWindow({
    width: 1440, height: 920, minWidth: 980, minHeight: 680,
    backgroundColor: '#f6f7fb', title: 'WMR Writing Mentor',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true }
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isInternalNavigation(url, baseUrl)) event.preventDefault();
  });
  await mainWindow.loadURL(baseUrl);
  mainWindow.on('closed', () => { mainWindow = null; });
}
app.whenReady().then(createWindow).catch(error => {
  console.error('WMR startup failed:', error.message);
  if (runtime) runtime.kill();
  app.quit();
});
app.on('before-quit', () => {
  startupToken = '';
  if (runtime) runtime.kill();
});
app.on('window-all-closed', () => app.quit());
