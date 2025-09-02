const { app, BrowserWindow, globalShortcut, ipcMain, Menu, session } = require('electron')
const path = require('path')

const KIOSK_APP_URL = 'https://cedt-next.private-crc.org/api/kiosks';

/* FUNCTIONS DEFINITION ******************************************************/

function showNetworkErrorScreen(win) {
  win.loadURL('data:text/html;charset=utf-8,' +
    encodeURIComponent(`
      <html>
      <head>
        <title>Orange Network Unreachable</title>
        <style>
          body { font-family: Arial, sans-serif; background: #222; color: #fff; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .splash { background: #ff9800; color: #222; padding: 32px 40px; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.18); }
          h1 { margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="splash">
          <h1>Orange Network could not be reached</h1>
          <p>Please check your internet connection or VPN and try again.</p>
        </div>
      </body>
      </html>
    `)
  );
}

function loadKioskAppUrl(win) {
  const https = require('https');
  https.get(KIOSK_APP_URL, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      win.loadURL(KIOSK_APP_URL);
    } else {
      showNetworkErrorScreen(win);
    }
  }).on('error', () => {
    showNetworkErrorScreen(win);
  });
}

function initializeWindow(win) {
  loadKioskAppUrl(win);

  win.webContents.setWindowOpenHandler(({ url }) => {
    win.webContents.loadURL(url)
    return { action: 'deny' }
  })

  win.webContents.send('set-toolbar-color', 'rgba(17, 255, 0, 0.7)');
}

function createWindow() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const win = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true,
    resizable: true,
    movable: true,
    minimizable: true,
    maximizable: true,
    fullScreenable: true,
    closable: true,
    // alwaysOnTop: true,
    backgroundColor: '#000000',
  })

  win.setContentProtection(true);

  return win;
}

function toggleKioskMode() {
  const win = BrowserWindow.getFocusedWindow()
  if (!win) return; // Guard against no focused window

  const isCurrentlyKiosk = win.isKiosk();
  console.log('Current kiosk state:', isCurrentlyKiosk);

  if (isCurrentlyKiosk) {
    win.setKiosk(false);
    win.webContents.send('set-toolbar-color', 'rgba(17, 255, 0, 0.7)');
    console.log('Exit kiosk mode');
  } else {
    win.setFullScreen(false);
    setTimeout(() => {
      win.setKiosk(true);
      win.webContents.send('set-toolbar-color', 'rgba(255, 8, 0, 0.7)');
      console.log('Entered kiosk mode');
    }, 200);
  }
}

function createAppMenu() {
  const version = app.getVersion(); 
  const template = [
    {
      label: 'Edit',
      submenu: [
        { role: 'paste' }
      ]
    },
    {
      label: 'App',
      submenu: [
        { label: `Version ${version}`, enabled: false },
        { type: 'separator' },
        {
          label: 'Toggle Kiosk Mode',
          accelerator: 'CommandOrControl+Shift+K',
          click: async () => toggleKioskMode()
        },
        {
          label: 'Clear Cache',
          click: async () => clearCache()
        },
        {
          label: 'Exit',
          click: async () => exitApp()
        },
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

async function clearCache() {
  try {
    const ses = session.defaultSession;
    if (ses) {
      await ses.clearStorageData();
      await ses.clearCache();
      console.log("Cache and storage cleared successfully.");
    }
  } catch (err) {
    console.error("Error clearing cache:", err);
  }
}

async function exitApp() {
  await clearCache();
  app.quit();
  process.exit(0);
}

/* IPC HANDLERS ******************************************************/

ipcMain.on('toggle-kiosk', () => {
  toggleKioskMode();
})

ipcMain.on('quit-app', async () => {
  await exitApp();
})

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
})

/* EVENT HANDLERS ******************************************************/

app.on('window-all-closed', async () => {
  await exitApp();
});

app.whenReady().then(() => {
  const win = createWindow()

  initializeWindow(win)
  createAppMenu();

  globalShortcut.register('CommandOrControl+Shift+K', toggleKioskMode)
})
