const { exec } = require('child_process');

function registerIpc(ipcMain) {

    // get yubikeys
    ipcMain.on('get-yubikeys', (event, arg) => {

        // count
        if(arg === "count") {
            getYubikeys((count) => {
                event.reply('keys', count)
            })
        }

        // list, map, tree
    })
}


function getYubikeys(callback) {
    var command = "gpg --list-secret-keys"
    exec(command, (err, stdout, stderr) => {
        var count = -1;
        if (err) {
            console.log(err)
            callback(count)
        }
        else {
            // count 'sec' word
            count = (stdout.match(/sec/g) || []).length;
            callback(count)
        }
    });
}

module.exports.registerIpc = registerIpc