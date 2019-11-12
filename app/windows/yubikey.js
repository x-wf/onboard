const { BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let window


function enableInputs(enable) {

    if(typeof enable == undefined)
        enable = false;

    if(window != undefined)
        window.webContents.executeJavaScript("$('input,button').attr('disabled', "+!enable+");");
}

function destroyWindow() {
    if(window != undefined)
        window.close()

    window = undefined
}

function getWindow() {
    return window
}

function createWindow (parent, details) {
    if (window == undefined) {

        // Window config
        window = new BrowserWindow({
            parent: parent, 
            modal: true,
            width: 400,
            height: 380,
            frame: true,
            maximizable: false,
            resizable: false,
            fullscreenWindowTitle: "true",
            vibrancy: "appearance-based", //dark, light, appearance-based
            icon: path.join(__dirname, 'html/img/radix-icon.png'),
            type:'toolbar',
            webPreferences: {
                nodeIntegration: true,
                experimentalFeatures: true
            },
        })

        // Load page
        window.loadFile('./html/yubikey_form.html')
        window.on('closed', () => {
            window = undefined
        })
        // Provision
        window.webContents.on('did-finish-load', function() {
            setTimeout(()=>{window.webContents.send("user-details", details)}, 900)
        })
        // register IPC's here
    }
    return window
}

module.exports.enableInputs = enableInputs
module.exports.createWindow = createWindow
module.exports.destroyWindow = destroyWindow
module.exports.getWindow = getWindow
