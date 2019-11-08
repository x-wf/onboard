const { app, dialog } = require('electron')
const autostart = require('./app/autostart')
const systemTray = require('./app/tray')
const startWindow = require('./app/windows/start')
const fixPath = require('fix-path');
const log4js = require('log4js');


   
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
    app.quit()
    return;
}

app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (startWindow.getWindow()) {
        if (startWindow.getWindow().isMinimized()) startWindow.getWindow().restore()
            startWindow.getWindow().focus()
    } else {
        startWindow.createWindow(app)
    }
})

app.on('window-all-closed', () => {
    startWindow.destroyWindow()
    if (process.platform !== 'darwin') {
        app.quit()
    }
    else {
        app.dock.hide();
    }
})
app.on('ready', () => {
    startApp()
})


function startApp() {
    fixPath();

    // main window
    var window = startWindow.createWindow(app)
 
    // tray
    var tray = systemTray.createTray()
    
    // logger
    log4js.configure({
        appenders: { app: {type: 'file', filename: '/tmp/radix-onboard.log' } },
        categories: { default: { appenders: ['app'], level: 'ERROR' } }
    });
    
    // create autostart agent
    autostart.createAgent()
}