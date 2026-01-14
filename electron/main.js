const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { autoUpdater } = require('electron-updater');

let mainWindow;

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  // Load the built app - always start at admin login page
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173/login-admin');
    mainWindow.webContents.openDevTools();
  } else {
    // Load the built app with admin login route
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

    // Navigate to admin login after page loads
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.executeJavaScript(`
        window.location.hash = '#/login-admin';
      `);

      // Check for updates after window loads (only in production)
      checkForUpdates();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ==================== AUTO UPDATER ====================

function checkForUpdates() {
  autoUpdater.checkForUpdates().catch(err => {
    console.log('Update check failed:', err);
  });
}

// Send update status to renderer
function sendUpdateStatus(status, data = {}) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('update-status', { status, ...data });
  }
}

// Auto-updater events
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for updates...');
  sendUpdateStatus('checking');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info.version);
  sendUpdateStatus('available', {
    version: info.version,
    releaseNotes: info.releaseNotes
  });
});

autoUpdater.on('update-not-available', () => {
  console.log('No updates available');
  sendUpdateStatus('not-available');
});

autoUpdater.on('download-progress', (progress) => {
  console.log(`Download progress: ${progress.percent.toFixed(1)}%`);
  sendUpdateStatus('downloading', {
    percent: progress.percent,
    transferred: progress.transferred,
    total: progress.total
  });
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info.version);
  sendUpdateStatus('downloaded', { version: info.version });
});

autoUpdater.on('error', (error) => {
  console.error('Update error:', error);
  sendUpdateStatus('error', { message: error.message });
});

// IPC handlers for renderer communication
ipcMain.handle('check-for-updates', () => {
  checkForUpdates();
});

ipcMain.handle('download-update', () => {
  autoUpdater.downloadUpdate().catch(err => {
    console.error('Download failed:', err);
  });
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// ==================== APP LIFECYCLE ====================

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
