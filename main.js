const { app, BrowserWindow, globalShortcut, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs   = require('fs');
const fsp  = require('fs').promises;

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

// ── Vault filesystem operations ──────────────────────────────────────────
// These IPC handlers back the folder-mode feature. The renderer picks a
// folder (via native dialog), then reads/writes .md files inside it directly.
// All paths are resolved against the vault root the user opened. Paths that
// escape the root (via .. or absolute) are rejected as a safety measure.

// Track the currently-open vault root per-window
let currentVaultRoot = null;

function isPathSafe(root, target) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  // Must be inside the root (or equal to it)
  return resolvedTarget === resolvedRoot || resolvedTarget.startsWith(resolvedRoot + path.sep);
}

function resolveInVault(relPath) {
  if (!currentVaultRoot) throw new Error('No vault open');
  const full = path.resolve(currentVaultRoot, relPath || '');
  if (!isPathSafe(currentVaultRoot, full)) {
    throw new Error('Path escapes vault root');
  }
  return full;
}

// Open a native folder-picker; returns the selected folder path or null
ipcMain.handle('vault:pickFolder', async () => {
  const win = BrowserWindow.getFocusedWindow();
  const result = await dialog.showOpenDialog(win, {
    title: 'Open notes folder',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (result.canceled || !result.filePaths.length) return null;
  return result.filePaths[0];
});

// Set the vault root for subsequent operations
ipcMain.handle('vault:open', async (_e, folderPath) => {
  if (!folderPath) throw new Error('No folder given');
  const stat = await fsp.stat(folderPath);
  if (!stat.isDirectory()) throw new Error('Not a directory');
  currentVaultRoot = folderPath;
  return folderPath;
});

// Close the vault (return to no-vault mode)
ipcMain.handle('vault:close', async () => {
  currentVaultRoot = null;
  return true;
});

// List a directory (relative to vault root). Returns array of
// { name, path (rel), isDir, mtime } sorted with dirs first then by name.
ipcMain.handle('vault:list', async (_e, relDir) => {
  const full = resolveInVault(relDir || '');
  const entries = await fsp.readdir(full, { withFileTypes: true });
  const results = [];
  for (const ent of entries) {
    // Skip hidden files/dirs and the images sidecar
    if (ent.name.startsWith('.')) continue;
    if (!ent.isDirectory() && !ent.name.endsWith('.md')) continue;
    const entPath = path.join(full, ent.name);
    let mtime = 0;
    try { mtime = (await fsp.stat(entPath)).mtimeMs; } catch(e) {}
    // rel path uses forward slashes for consistency in the renderer
    const rel = path.join(relDir || '', ent.name).split(path.sep).join('/');
    results.push({
      name: ent.name,
      path: rel,
      isDir: ent.isDirectory(),
      mtime,
    });
  }
  // Directories first, then files, each alphabetically
  results.sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return results;
});

// Read a .md file's contents
ipcMain.handle('vault:read', async (_e, relPath) => {
  const full = resolveInVault(relPath);
  return await fsp.readFile(full, 'utf8');
});

// Write a .md file (creating parent dirs if needed)
ipcMain.handle('vault:write', async (_e, relPath, content) => {
  const full = resolveInVault(relPath);
  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, content, 'utf8');
  return true;
});

// Rename or move a file/folder within the vault
ipcMain.handle('vault:rename', async (_e, oldRel, newRel) => {
  const oldFull = resolveInVault(oldRel);
  const newFull = resolveInVault(newRel);
  await fsp.mkdir(path.dirname(newFull), { recursive: true });
  await fsp.rename(oldFull, newFull);
  return true;
});

// Delete a file (moves to system trash rather than permanent delete)
ipcMain.handle('vault:delete', async (_e, relPath) => {
  const full = resolveInVault(relPath);
  await shell.trashItem(full);
  return true;
});

// Create an empty folder
ipcMain.handle('vault:mkdir', async (_e, relPath) => {
  const full = resolveInVault(relPath);
  await fsp.mkdir(full, { recursive: true });
  return true;
});

// Check if a file exists (returns true/false, never throws)
ipcMain.handle('vault:exists', async (_e, relPath) => {
  try {
    const full = resolveInVault(relPath);
    await fsp.access(full);
    return true;
  } catch(e) { return false; }
});

// Write a binary file (e.g. pasted image) — content is a base64 string
ipcMain.handle('vault:writeBinary', async (_e, relPath, base64) => {
  const full = resolveInVault(relPath);
  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, Buffer.from(base64, 'base64'));
  return true;
});

// Read a binary file back as base64 (for image rendering)
ipcMain.handle('vault:readBinary', async (_e, relPath) => {
  const full = resolveInVault(relPath);
  const buf = await fsp.readFile(full);
  return buf.toString('base64');
});
