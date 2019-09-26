const { BrowserWindow, ipcMain } = require('electron')
const yubikeys = require('./yubikey')
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
        window = new BrowserWindow({
            width: 800,
            height: 600,
            frame: true,
            // maximizable: false,
            // resizable: false,
            fullscreenWindowTitle: "true",
            vibrancy: "dark", //dark, light, appearance-based
            icon: path.join(__dirname, '../html/img/radix-icon.png'),
            webPreferences: {
                nodeIntegration: true,
                experimentalFeatures: true
            },
        })

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
    }
    return window
}

// More functions for business logic
// e.g. autostart, yubikeys, icontray

// 1 - ICONTRAY
// 2 - YUBIKEYS
// 3 - RUN AS SUDO (e.g. read/write tunnelblick config, by default not sudo)
// 4 - MAKE AUTOSTART

module.exports.createWindow = createWindow
module.exports.destroyWindow = destroyWindow
module.exports.getWindow = getWindow
