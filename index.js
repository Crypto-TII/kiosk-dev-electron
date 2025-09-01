const { app, BrowserWindow, BrowserView, globalShortcut, ipcMain } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true,
    titleBarStyle: 'default',
    resizable: true,
    movable: true,
    minimizable: true,
    maximizable: true,
    closable: true
  })


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

  // Start in kiosk mode
  // win.setKiosk(true)
  // win.setMenuBarVisibility(false)

  // IPC handlers
  ipcMain.on('quit-app', () => {
    app.quit()
  })

  ipcMain.on('toggle-kiosk', () => {
    const next_state_is_kiosk = !win.isKiosk();
    win.setKiosk(next_state_is_kiosk);
    win.setMenuBarVisibility(!next_state_is_kiosk);
    win.setResizable(!next_state_is_kiosk);
    win.setMovable(!next_state_is_kiosk);
    win.setMinimizable(!next_state_is_kiosk);
    win.setMaximizable(!next_state_is_kiosk);
    win.setClosable(!next_state_is_kiosk);
    win.setFullScreen(next_state_is_kiosk);
    // win.setFrame(!next_state_is_kiosk ? true : false);
  })

  // Disable common shortcuts that interfere
  win.webContents.on('before-input-event', (event, input) => {
    const forbidden = [
      'F12', // DevTools
      'Control+W', // Close tab
      'Control+T', // New tab
      'Control+R', // Reload
      'F5'
    ]
    if (forbidden.includes(input.key) || (input.control && ['w','t','r'].includes(input.key.toLowerCase()))) {
      event.preventDefault()
    }
  })

  // Handle new window creation
  win.webContents.setWindowOpenHandler(({ url }) => {
    win.webContents.loadURL(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  const win = createWindow()

  // Disable global shortcuts like Cmd+Q on macOS (optional)
  globalShortcut.unregisterAll()

  // Register a rarely-used global shortcut to toggle kiosk mode
  globalShortcut.register('Control+Shift+G', () => {
    if (win && !win.isDestroyed()) {
      win.setKiosk(!win.isKiosk())
      win.setMenuBarVisibility(!win.isKiosk())
    }
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  app.quit();
  process.exit(0);
})
