const { app, BrowserWindow, utilityProcess, shell } = require('electron');
const path = require('node:path');

let runtime = null;
let mainWindow = null;
const port = 4179;
const baseUrl = 'http://127.0.0.1:' + port;

if (!app.requestSingleInstanceLock()) app.quit();
else app.on('second-instance', () => {
  if (mainWindow) { if (mainWindow.isMinimized()) mainWindow.restore(); mainWindow.focus(); }
});

async function waitForRuntime() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(baseUrl + '/api/health', { signal: AbortSignal.timeout(700) });
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 180));
  }
  throw new Error('WMR local runtime did not become ready.');
}

async function createWindow() {
  runtime = utilityProcess.fork(path.join(app.getAppPath(), 'server/index.mjs'), [], {
    serviceName: 'WMR Local Runtime', stdio: 'pipe',
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), WMR_DATA_DIR: app.getPath('userData') }
  });
  runtime.on('exit', code => {
    if (code && mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send('wmr-runtime-error', 'Local runtime stopped. Restart WMR to continue.');
  });
  await waitForRuntime();
  mainWindow = new BrowserWindow({
    width: 1440, height: 920, minWidth: 980, minHeight: 680,
    backgroundColor: '#f6f7fb', title: 'WMR Writing Mentor',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true }
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => { if (url.startsWith('https://')) shell.openExternal(url); return { action: 'deny' }; });
  mainWindow.webContents.on('will-navigate', (event, url) => { if (!url.startsWith(baseUrl + '/')) event.preventDefault(); });
  await mainWindow.loadURL(baseUrl);
  mainWindow.on('closed', () => { mainWindow = null; });
}
app.whenReady().then(createWindow).catch(error => { console.error('WMR startup failed:', error.message); app.quit(); });
app.on('before-quit', () => { if (runtime) runtime.kill(); });
app.on('window-all-closed', () => app.quit());
