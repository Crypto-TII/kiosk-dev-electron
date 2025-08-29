
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  quitApp: () => ipcRenderer.send('quit-app'),
  toggleKiosk: () => ipcRenderer.send('toggle-kiosk')
})

window.addEventListener('DOMContentLoaded', () => {
  // Inject toolbar HTML
  console.log('Preload script running: injecting toolbar');
  const toolbarTrigger = document.createElement('div');
  toolbarTrigger.id = 'toolbar-trigger';
  toolbarTrigger.style.position = 'fixed';
  toolbarTrigger.style.top = '0';
  toolbarTrigger.style.left = '0';
  toolbarTrigger.style.width = '16px';
  toolbarTrigger.style.height = '16px';
  toolbarTrigger.style.zIndex = '9999';
//   toolbarTrigger.style.background = 'linear-gradient(200deg, #ff9800 60%, #fff3e0 100%)';
  toolbarTrigger.style.borderTopLeftRadius = '';
  toolbarTrigger.style.background = 'rgba(0, 60, 255, 0.49)';
  document.body.appendChild(toolbarTrigger);

  const toolbar = document.createElement('div');
  toolbar.id = 'toolbar';
  toolbar.style.position = 'fixed';
  toolbar.style.top = '0';
  toolbar.style.left = '0';
  toolbar.style.background = 'rgba(30,30,30,0.97)';
  toolbar.style.backdropFilter = 'blur(6px)';
  toolbar.style.padding = '16px 18px 12px 18px';
  toolbar.style.display = 'none';
  toolbar.style.borderRadius = '0 0 12px 12px';
  toolbar.style.zIndex = '9998';
  toolbar.style.minWidth = '160px';
  toolbar.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
  document.body.appendChild(toolbar);

  const releaseBtn = document.createElement('button');
  releaseBtn.className = 'toolbar-button';
  releaseBtn.textContent = 'Toggle Fullscreen';
  releaseBtn.style.background = 'linear-gradient(90deg, #ff9800 60%, #ffb74d 100%)';
  releaseBtn.style.color = '#222';
  releaseBtn.style.fontWeight = 'bold';
  releaseBtn.style.border = 'none';
  releaseBtn.style.padding = '10px 18px';
  releaseBtn.style.margin = '8px 0';
  releaseBtn.style.cursor = 'pointer';
  releaseBtn.style.borderRadius = '6px';
  releaseBtn.style.display = 'block';
  releaseBtn.style.width = '100%';
  releaseBtn.style.boxSizing = 'border-box';
  releaseBtn.style.boxShadow = '0 2px 6px rgba(255,152,0,0.12)';
  toolbar.appendChild(releaseBtn);

  const quitBtn = document.createElement('button');
  quitBtn.className = 'toolbar-button';
  quitBtn.textContent = 'Close App';
  quitBtn.style.background = 'linear-gradient(90deg, #e53935 60%, #ff7043 100%)';
  quitBtn.style.color = '#fff';
  quitBtn.style.fontWeight = 'bold';
  quitBtn.style.border = 'none';
  quitBtn.style.padding = '10px 18px';
  quitBtn.style.margin = '8px 0';
  quitBtn.style.cursor = 'pointer';
  quitBtn.style.borderRadius = '6px';
  quitBtn.style.display = 'block';
  quitBtn.style.width = '100%';
  quitBtn.style.boxSizing = 'border-box';
  quitBtn.style.boxShadow = '0 2px 6px rgba(229,57,53,0.12)';
  toolbar.appendChild(quitBtn);

  let timeoutId;
  let showToolbarTimeout;
  toolbarTrigger.addEventListener('mouseenter', () => {
    showToolbarTimeout = setTimeout(() => {
      toolbar.style.display = 'block';
    }, 1000); // 1 second delay
  });
  toolbar.addEventListener('mouseenter', () => {
    clearTimeout(timeoutId);
  });
  toolbar.addEventListener('mouseleave', () => {
    hideToolbarDelayed();
  });
  toolbarTrigger.addEventListener('mouseleave', (e) => {
    clearTimeout(showToolbarTimeout);
    if (!e.relatedTarget || !toolbar.contains(e.relatedTarget)) {
      hideToolbarDelayed();
    }
  });
  function hideToolbarDelayed() {
    timeoutId = setTimeout(() => {
      toolbar.style.display = 'none';
    }, 300);
  }
  quitBtn.addEventListener('click', () => {
    ipcRenderer.send('quit-app');
  });
  releaseBtn.addEventListener('click', () => {
    ipcRenderer.send('toggle-kiosk');
  });
});
