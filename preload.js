const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  quitApp: () => ipcRenderer.send('quit-app'),
  toggleKiosk: () => ipcRenderer.send('toggle-kiosk')
})

window.addEventListener('DOMContentLoaded', () => {
  // ---------- Styles (kept in one block for readability)
  const style = document.createElement('style')
  style.textContent = `
    #toolbar-trigger {
      position: fixed; top: 12px; left: 12px; z-index: 9999;
      width: 24px; height: 24px; border-radius: 12px;
      display: grid; place-items: center; cursor: pointer;
      background: rgba(17, 255, 0, 0.7); backdrop-filter: blur(6px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      user-select: none; -webkit-user-select: none;
    }
    #toolbar {
      position: fixed; top: 0; left: 0; z-index: 9998;
      background: rgba(30,30,30,0.97); backdrop-filter: blur(6px);
      padding: 16px 18px 12px 18px; border-radius: 0 0 12px 12px;
      min-width: 160px; box-shadow: 0 4px 16px rgba(0,0,0,0.18);
      display: none;
    }
    .toolbar-button {
      display: block; width: 100%; box-sizing: border-box;
      border: none; border-radius: 6px; padding: 10px 18px; margin: 8px 0;
      font-weight: bold; cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.12);
    }
  `
  document.head.appendChild(style)

  // ---------- Trigger (hamburger)
  const toolbarTrigger = document.createElement('button')
  toolbarTrigger.id = 'toolbar-trigger'
  toolbarTrigger.type = 'button'
  toolbarTrigger.setAttribute('aria-label', 'Open menu')
  toolbarTrigger.setAttribute('title', 'Menu')
  // toolbarTrigger.style.background = rgba(17, 255, 0, 0.7)
  document.body.appendChild(toolbarTrigger)

  // ---------- Toolbar
  const toolbar = document.createElement('div')
  toolbar.id = 'toolbar'
  document.body.appendChild(toolbar)

  const releaseBtn = document.createElement('button')
  releaseBtn.className = 'toolbar-button'
  releaseBtn.textContent = 'Toggle Kiosk Mode'
  releaseBtn.style.background = 'linear-gradient(90deg, #ff9800 60%, #ffb74d 100%)'
  releaseBtn.style.color = '#222'
  toolbar.appendChild(releaseBtn)

  const quitBtn = document.createElement('button')
  quitBtn.className = 'toolbar-button'
  quitBtn.textContent = 'Close App'
  quitBtn.style.background = 'linear-gradient(90deg, #e53935 60%, #ff7043 100%)'
  quitBtn.style.color = '#fff'
  toolbar.appendChild(quitBtn)

  // ---------- Behavior: click to toggle, outside click/Esc to close
  const showToolbar = () => { toolbar.style.display = 'block' }
  const hideToolbar = () => { toolbar.style.display = 'none' }
  const isOpen = () => toolbar.style.display !== 'none'

  toolbarTrigger.addEventListener('click', (e) => {
    e.stopPropagation()
    isOpen() ? hideToolbar() : showToolbar()
  })
  toolbar.addEventListener('click', (e) => e.stopPropagation())
  document.addEventListener('click', () => { if (isOpen()) hideToolbar() })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) hideToolbar() })

  // ---------- IPC wiring
  quitBtn.addEventListener('click', () => ipcRenderer.send('quit-app'))
  releaseBtn.addEventListener('click', () => ipcRenderer.send('toggle-kiosk'))

  // Allow main process to tint the trigger (e.g., status color)
  ipcRenderer.on('set-toolbar-color', (_event, color) => {
    toolbarTrigger.style.background = color
  })
})
