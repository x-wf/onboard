const electron = require('electron');
const { exec } = require('child_process');
const storage = require('node-persist');


async function registerIpc(ipcMain) {
    await storage.init({
        dir: (electron.app || electron.remote.app).getPath('userData'),
    });

    // last page
    ipcMain.on('last-page', async (event, arg) => {

        switch(arg[0]) {
            case "set": 
                await storage.setItem('last-page', arg[1])
                break;
            case "get": 
                let value = await storage.getItem('last-page');
                event.reply('last-page', value)
                break;
        }
    })
}

module.exports.registerIpc = registerIpc