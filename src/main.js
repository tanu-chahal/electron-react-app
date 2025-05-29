const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const log = require('electron-log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
const isDev = !app.isPackaged;

const appVersion = isDev ? require(path.join(__dirname, "../package.json")).version : app.getVersion();

const createAppMenu = () => {
  const template = [
    {
      label: "Help",
      submenu: [
        {
          label: "About Electron React App",
          click: () => {
            dialog.showMessageBox({
              type: "info",
              title: "About",
              message: `Electron React App\nVersion: ${appVersion}`
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadURL(
    isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  win.webContents.openDevTools({ mode: 'bottom' })

  win.webContents.on("did-finish-load", () => {
    autoUpdater.checkForUpdatesAndNotify();
  });
}

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-not-available', () => {
  log.info('No update available.');
});

autoUpdater.on("update-available", (info) => {
  log.info('Update available:', info);
  dialog.showMessageBox({
    type: "info",
    title: "Update Available",
    message: "A new version is available. Downloading now...",
  });
});

autoUpdater.on("update-downloaded", () => {
  log.info('Update downloaded and ready to install.');
  dialog
    .showMessageBox({
      type: "info",
      title: "Update Ready",
      message: "A new version has been downloaded. Restart now to install?",
      buttons: ["Restart", "Later"],
    })
    .then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
});

autoUpdater.on('error', (err) => {
  log.error('Update error:', err);
});

app.whenReady().then(() => {
  createAppMenu();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
