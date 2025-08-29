const { app, BrowserWindow, BrowserView, globalShortcut, ipcMain } = require('electron')
const path = require('path')

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
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


  // Load the original URL in the main window
  win.loadURL('https://cedt-next.private-crc.org/api/kiosks')

  // Start in kiosk mode
  win.setKiosk(true)
  win.setMenuBarVisibility(false)

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
  if (process.platform !== 'darwin') app.quit()
})
