import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage, ipcMain } from 'electron';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { AuthServer } from './authServer';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let authServer: AuthServer;

const SHORTCUT = 'CommandOrControl+Shift+V';

function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  const iconPath = path.join(__dirname, '../../assets/icon.icns');

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: true,
    transparent: false,
    backgroundColor: '#000000',
    hasShadow: true,
    skipTaskbar: false,
    alwaysOnTop: false,
    icon: iconPath,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const htmlPath = path.join(__dirname, '../../src/app/index.html');
  mainWindow.loadFile(htmlPath);

  // Fade in effect handled by renderer
  mainWindow.setOpacity(0);
  mainWindow.show();

  let opacity = 0;
  const fadeIn = setInterval(() => {
    opacity += 0.1;
    if (opacity >= 1) {
      opacity = 1;
      clearInterval(fadeIn);
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setOpacity(opacity);
    }
  }, 16);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Update authServer with current window
  if (authServer) {
    authServer.setMainWindow(mainWindow);
  }
}

function closeWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    let opacity = 1;
    const fadeOut = setInterval(() => {
      opacity -= 0.1;
      if (opacity <= 0) {
        opacity = 0;
        clearInterval(fadeOut);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.hide();
        }
      }
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.setOpacity(opacity);
      }
    }, 16);
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '../../assets/icon.icns');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open synq',
      click: () => createWindow()
    },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('synq - Spotify Visualizer');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => createWindow());
}

app.whenReady().then(() => {
  // Set app name
  app.setName('synq');

  // Initialize auth server
  authServer = new AuthServer();

  // Register global shortcut
  const registered = globalShortcut.register(SHORTCUT, () => {
    if (mainWindow && mainWindow.isVisible()) {
      closeWindow();
    } else {
      createWindow();
    }
  });

  if (!registered) {
    console.error('Global shortcut registration failed');
  }

  // Create tray icon
  createTray();

  // Open window on first launch
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // Prevent app from quitting - keep running in background
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC handlers
ipcMain.on('close-window', () => {
  closeWindow();
});

ipcMain.on('start-auth', () => {
  authServer.startAuthFlow();
});

// Export close function for IPC
export { closeWindow };
