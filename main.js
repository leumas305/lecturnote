const { app, BrowserWindow, globalShortcut, Menu, shell } = require('electron');
const path = require('path');
const fs   = require('fs');

app.commandLine.appendSwitch('disable-features', 'GlobalMediaControls');

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.js');
  console.log('[lecturnote] __dirname:', __dirname);
  console.log('[lecturnote] preload path:', preloadPath);
  console.log('[lecturnote] preload exists:', fs.existsSync(preloadPath));

  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 500,
    title: 'lecturnote',
    icon: path.join(__dirname, 'assets', 'icon.png'),
    backgroundColor: '#0f0f13',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Remove the default application menu entirely so no browser shortcuts
  // interfere with the editor (Ctrl+B, Ctrl+I, Ctrl+F, Ctrl+G, etc.)
  Menu.setApplicationMenu(null);

  win.loadFile('index.html');

  // On macOS, re-register just the ones we need at OS level
  // (Cmd+Q to quit, Cmd+H to hide, Cmd+M to minimize)
  if (process.platform === 'darwin') {
    const macMenu = Menu.buildFromTemplate([
      {
        label: app.name,
        submenu: [
          { label: 'About lecturnote', role: 'about' },
          { type: 'separator' },
          { label: 'Hide lecturnote', accelerator: 'Command+H', role: 'hide' },
          { label: 'Hide Others',     accelerator: 'Command+Alt+H', role: 'hideOthers' },
          { type: 'separator' },
          { label: 'Quit',            accelerator: 'Command+Q', role: 'quit' },
        ],
      },
      {
        // Minimal edit menu — only OS-level text actions, nothing that
        // conflicts with the editor's own shortcuts
        label: 'Edit',
        submenu: [
          { label: 'Undo',       accelerator: 'CmdOrCtrl+Z',       role: 'undo' },
          { label: 'Redo',       accelerator: 'CmdOrCtrl+Shift+Z', role: 'redo' },
          { type: 'separator' },
          { label: 'Cut',        accelerator: 'CmdOrCtrl+X',       role: 'cut' },
          { label: 'Copy',       accelerator: 'CmdOrCtrl+C',       role: 'copy' },
          { label: 'Paste',      accelerator: 'CmdOrCtrl+V',       role: 'paste' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A',       role: 'selectAll' },
        ],
      },
      {
        label: 'Window',
        submenu: [
          { label: 'Minimize', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
          { label: 'Zoom',     role: 'zoom' },
          { type: 'separator' },
          { label: 'Toggle Full Screen', accelerator: process.platform === 'darwin' ? 'Ctrl+Command+F' : 'F11', role: 'togglefullscreen' },
        ],
      },
    ]);
    Menu.setApplicationMenu(macMenu);
  }

  // Open DevTools only in dev mode (set NODE_ENV=development to enable)
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }

  // Intercept external link clicks and open them in the default browser
  // instead of inside the app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
