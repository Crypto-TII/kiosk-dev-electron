const { app, BrowserWindow, globalShortcut, ipcMain, Menu } = require('electron')
const path = require('path')

// ---------------------   WINDOW START

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

  // Check if the website is reachable before loading
  const targetUrl = 'https://cedt-next.private-crc.org/api/kiosks';
  const https = require('https');
  https.get(targetUrl, (res) => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      win.loadURL(targetUrl);
    } else {
      showSplash(win);
    }
  }).on('error', () => {
    showSplash(win);
  });

  function showSplash(win) {
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

  // Handle new window creation
  win.webContents.setWindowOpenHandler(({ url }) => {
    win.webContents.loadURL(url)
    return { action: 'deny' }
  })

  // win.setKiosk(true);         // Enable kiosk mode
  // win.setAlwaysOnTop(true);   // Ensure window stays on top
  // win.webContents.send('toggle-kiosk-color', 'rgba(255, 8, 0, 0.7)');
  // console.log('Entered kiosk mode');
  win.webContents.send('toggle-kiosk-color', 'rgba(17, 255, 0, 0.7)');
}

// ---------------------   WINDOW END

function toggleKiosk() {
  const win = BrowserWindow.getFocusedWindow()
  if (!win) return; // Guard against no focused window

  const isCurrentlyKiosk = win.isKiosk();
  console.log('Current kiosk state:', isCurrentlyKiosk);

  if (isCurrentlyKiosk) {
    // Exit kiosk mode sequence
    win.setKiosk(false);         // Disable kiosk mode
    // win.setAlwaysOnTop(true);   //  window stays on top
    win.webContents.send('toggle-kiosk-color', 'rgba(17, 255, 0, 0.7)');
    console.log('Exit kiosk mode');
  } else {
    // Enter kiosk mode sequence
    win.setFullScreen(false);     // Exit fullscreen first
    // Wait for fullscreen to be fully disabled
    setTimeout(() => {
      win.setKiosk(true);         // Enable kiosk mode
      // win.setAlwaysOnTop(true);   // Ensure window stays on top
      win.webContents.send('toggle-kiosk-color', 'rgba(255, 8, 0, 0.7)');
      console.log('Entered kiosk mode');
    }, 200);
  }
}

function createAppMenu() {
  const template = [
    // Edit menu (needed for copy/paste shortcuts)
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    // App menu with Exit
    {
      label: 'App',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// IPC handlers
ipcMain.on('quit-app', () => {
  app.quit();
  process.exit(0);
})

ipcMain.on('toggle-kiosk', () => {
  toggleKiosk();
})

app.whenReady().then(() => {
  const win = createWindow()
  createAppMenu()


  // Disable global shortcuts like Cmd+Q on macOS (optional)
  // globalShortcut.unregisterAll()

  globalShortcut.register('CommandOrControl+Shift+K', toggleKiosk)

})

app.on('window-all-closed', () => {
  app.quit();
  process.exit(0);
})