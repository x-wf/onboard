const { app } = require('electron');
const { autoUpdater } = require('electron-updater');
const startWindow = require('./windows/start')
const log4js = require('log4js');
const logger = log4js.getLogger("app"); 

autoUpdater.on('update-available', () => {
    if(startWindow.getWindow()) {
        startWindow.getWindow().webContents.send('update_available');
    }
});

autoUpdater.on('update-downloaded', () => {
    if(startWindow.getWindow())
        startWindow.getWindow().webContents.send('update_downloaded');
});

autoUpdater.on('download-progress', (progressObj) => {
    if(startWindow.getWindow())
        startWindow.getWindow().webContents.send('download_progress', Math.round(progressObj.percent));
})

autoUpdater.on('error', message => {
    logger.error("error while updating program:")
    logger.error(message)
})

function registerIpc(ipcMain) {

    ipcMain.on('app_version', (event) => {
        event.sender.send('app_version', { version: app.getVersion() });
    });
    ipcMain.on('restart_app', () => {
        app.isQuiting = true;
        autoUpdater.quitAndInstall();
        app.quit();
    });
}

function checkForUpdates() {
    autoUpdater.checkForUpdatesAndNotify();
}

module.exports.registerIpc = registerIpc
module.exports.checkForUpdates = checkForUpdates