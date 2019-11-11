const { app, BrowserWindow, ipcMain } = require('electron')
const { autoUpdater } = require('electron-updater');
const yubikeys = require('../yubikey')
const persist = require('../persist')
const path = require('path')
const url = require('url')


let window

function destroyWindow() {
    window = undefined
}

function getWindow() {
    return window
}

function createWindow () {
    if (window == undefined) {

        // Window config
        console.log(path.join(app.getAppPath(), 'build/icon.icns'))
        
        const iconUrl = url.format({
            pathname: path.join(__dirname, '../html/img/radix-icon-16x16-circle.png'),
            protocol: 'file:',
            slashes: true
        })

        window = new BrowserWindow({
            width: 800,
            height: 600,
            frame: true,
            maximizable: false,
            resizable: false,
            fullscreenWindowTitle: "true",
            vibrancy: "dark", //dark, light, appearance-based
            icon: iconUrl,
            webPreferences: {
                nodeIntegration: true,
                experimentalFeatures: true
            },
        })
        window.setTitle(`Guide ${app.getVersion()}`)

        // Load page
        window.loadFile('./html/index.html')
        window.on('close', (event) => {
            // run in background
            if(!app.isQuiting){
                window.hide();
                event.preventDefault();
                app.dock.hide();
            }
            return false
        })
        window.on('show',function(event){
            app.dock.show();
        });
        window.on('minimize',function(event){
            event.preventDefault();
            window.hide();
        });

        // register IPC's here
        yubikeys.registerIpc(ipcMain)
        persist.registerIpc(ipcMain)
        registerIpc(ipcMain)
    }
    return window
}

function registerIpc(ipcMain) {
    ipcMain.on('app_version', (event) => {
        event.sender.send('app_version', { version: app.getVersion() });
    });
    ipcMain.on('restart_app', () => {
        autoUpdater.quitAndInstall();
    });
}


module.exports.createWindow = createWindow
module.exports.destroyWindow = destroyWindow
module.exports.getWindow = getWindow
