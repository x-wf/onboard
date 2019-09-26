const { app } = require('electron')
const autostart = require('./app/autostart')
const systemTray = require('./app/tray')
const startWindow = require('./app/start')


app.on('ready', () => {
    startApp()
})

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    startApp()
})


function startApp() {
    var window = startWindow.createWindow(app)
    var tray = systemTray.createTray()
    
    autostart.createPlist()
}
