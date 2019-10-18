const { BrowserWindow, ipcMain } = require('electron')
const yubikeys = require('../yubikey')
const persist = require('../persist')
const path = require('path')


let window

function destroyWindow() {
    window = undefined
}

function getWindow() {
    return window
}

function createWindow (app) {
    if (window == undefined) {

        // Window config
        window = new BrowserWindow({
            width: 800,
            height: 600,
            frame: true,
            maximizable: false,
            resizable: false,
            fullscreenWindowTitle: "true",
            vibrancy: "dark", //dark, light, appearance-based
            icon: path.join(__dirname, '../../html/img/radix-icon.png'),
            webPreferences: {
                nodeIntegration: true,
                experimentalFeatures: true
            },
        })

        // Load page
        window.loadFile('./html/index.html')
        window.on('closed', (event) => {
            // run in background
            if(!app.isQuiting){
                event.preventDefault();
            }
            return false;
        })

        // register IPC's here
        yubikeys.registerIpc(ipcMain)
        persist.registerIpc(ipcMain)
    }
    return window
}

module.exports.createWindow = createWindow
module.exports.destroyWindow = destroyWindow
module.exports.getWindow = getWindow
