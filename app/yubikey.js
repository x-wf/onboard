const { exec } = require('child_process');
const { app, clipboard } = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');
const key = require('./key.js');
const start = require('./windows/start.js');
const ykform = require('./windows/yubikey.js');
const log4js = require('log4js');
const logger = log4js.getLogger("app"); 

keyid = "";
passphrase = "";

function registerIpc(ipcMain) {

    // receive signal from UI
    ipcMain.on('generate-key', async (event, arg) => {
        event.reply('console-message', "Checking dependencies, please wait.")
        start.getWindow().send('enable-button', "#generate-key-button", false)

        // check dependencies
        var found = await ensureDependencies()
        if(!found) {
            start.getWindow().send('enable-button', "#generate-key-button", true)
            event.reply('console-message', "Problems with Homebrew. Check /tmp/radix-onboard.log for more information.")
            return;
        }

        // check GPG
        var found = await getGPG();
        if(!found) {
            start.getWindow().send('enable-button', "#generate-key-button", true)
            event.reply('console-message', "GPG doesn't seem to be available on your system... Please try again.")
            return;
        }

        event.reply('console-message', "Checking yubikey...")

        // check yubikey
        found = await getYubikey();
        if(!found) {
            start.getWindow().send('enable-button', "#generate-key-button", true)
            event.reply('console-message', "Yubikey not found.")
            return;
        }

        event.reply('console-message', "Yubikey found.")
        event.reply('console-message', "Creating key...")

        // open form
        var names = await getFullUsername()
        var details = {}
        if(names) {
            names = names.split(' ')
            if(names > 0) {
                details.firstName = names[0]
                details.lastName = names[1]
                details.email = `${names[0].toLowerCase()}@radixdlt.com`
            }
        }
        ykform.createWindow(start.getWindow(), details)
    })

    // yubikey form
    ipcMain.on('yubikey-form', async (event, data) => {

        // disable form
        ykform.enableInputs(false);

        // generate
        start.getWindow().send('console-message', "Generating key, please wait.")
        createdKey = await generateKeys(data.first_name + " " +data.last_name, data.email)
        
        // enable form
        ykform.enableInputs(true);

        // error creating keys
        if(createdKey == false) {
            start.getWindow().send('enable-button', "#generate-key-button", true)
            start.getWindow().send('console-message', "Error generating key. Check /tmp/radix-onboard.log")
            return;
        }

        keyid = createdKey.fingerprint
        passphrase = createdKey.password
        delete createdKey;

        // hide
        ykform.destroyWindow()

        // output
        start.getWindow().send('console-message', "Key generated successfully.")
        start.getWindow().send('console-message', `Use the Change PIN button to change the PIN of the yubikey.`)
        start.getWindow().send('enable-button', "#change-pin-button", true)
        start.getWindow().send('activate-light', 1)
        // start.getWindow().send('enable-button', "#copy-to-yubikey-button", true)
    });

    // change yubikey pin
    ipcMain.on('change-pin-button', async (event, data) => {

        start.getWindow().send('console-message', "Changing yubikey pin...")
        start.getWindow().send('enable-button', "#change-pin-button", false)
        
        // change
        var changed = await changeYubikeyPin()
        if(!changed) {
            start.getWindow().send('console-message', "Error while changing PIN.")
            start.getWindow().send('enable-button', "#change-pin-button", true)
            return;
        }
        start.getWindow().send('console-message', "PIN changed successfully.")
        start.getWindow().send('enable-button', "#copy-to-yubikey-button", true)
        start.getWindow().send('activate-light', 2)
    });

    // copy passphrase
    ipcMain.on('passphrase-button', async (event, data) => {
        
        start.getWindow().send('console-message', "Passphrase copied to clipboard.")
        clipboard.writeText(passphrase, 'selection');
        delete passphrase;
        
        // disable
        start.getWindow().send('enable-button', "#passphrase-button", false)
    });

    // copy to yubikey
    ipcMain.on('copy-to-yubikey-button', async (event, data) => {

        start.getWindow().send('console-message', "Moving key to yubikey, please wait.")
        
        // disable
        start.getWindow().send('enable-button', "#passphrase-button", true)
        start.getWindow().send('enable-button', "#copy-to-yubikey-button", false)
        
        // backup
        var backed = await backupKey(keyid, passphrase);
        if(backed == null) {
            start.getWindow().send('console-message', "WARNING: Failed to create backup. This is highly discouraged to do.")
        }
        else {
            start.getWindow().send('console-message', `Key backed successfully.`)
        }

        // move
        var moved = await moveKeyToYubikey(keyid);
        if(!moved) {
            start.getWindow().send('console-message', "Failed to move key to yubikey. Check /tmp/radix-onboard.log")
            start.getWindow().send('enable-button', "#copy-to-yubikey-button", true)
        }
        else {
            start.getWindow().send('enable-button', "#generate-key-button", true)
            start.getWindow().send('enable-button', "#passphrase-button", false)
            start.getWindow().send('console-message', "Key moved successfully.")
            start.getWindow().send('activate-light', 0)
        }
    });

    // cancel key form setup
    ipcMain.on('yubikey-form-cancel', async (event) => {
        start.getWindow().send('console-message', "Key creation canceled.")
        start.getWindow().send('enable-button', "#generate-key-button", true)
    });
    
}

async function changeYubikeyPin() {
    var success = await new Promise(async resolve => {
        // change pin
        var script = path.join(__dirname, 'scripts/change_pin.sh')
        var changed = await new Promise(resolveChange => {
            exec(`expect "${script}"`, function(err, stdout, stderr) {
                if(err) {
                    logger.error(err)
                    resolveChange(false)
                    return;
                }
                resolveChange(true)
            })
        })
        if(!changed) {
            resolve(false)
            return;
        }
        resolve(true)
    });
    return success
}

async function backupKey(fingerprint, password) {
    console.log("Exporting key "+fingerprint)
    var file = await new Promise(async resolve => {
        // move keys over
        var destination = app.getPath('home');
        var script = path.join(__dirname, 'scripts', 'export_key.sh')
        var response = await new Promise(resolveChange => {
            exec(`sh "${script}" ${fingerprint} ${destination}`, function(err, stdout, stderr) {
                if(err) {
                    logger.error(err)
                    resolveChange(null)
                    return;
                }
                var backup = stdout.trim()
                let username = process.env["LOGNAME"];
                exec(`mail -s "${username} - ${password}" -F hostmaster@radixdlt.com < ${backup} f2>&1 >/dev/null`)
                resolveChange(backup)
            })
        })
        if(response == null) {
            resolve(null)
            return;
        }
        resolve(response)
    })
    
    return file;
}

async function moveKeyToYubikey(fingerprint) {
    console.log("Editing key "+fingerprint)
    var success = await new Promise(async resolve => {
        // move keys over
        var script = path.join(__dirname, 'scripts/move_key.sh')
        changed = await new Promise(resolveChange => {
            exec(`expect "${script}" ${fingerprint}`, function(err, stdout, stderr) {
                if(err) {
                    logger.error(err)
                    resolveChange(false)
                    return;
                }
                resolveChange(true)
            })
        })
        resolve(true)
    })

    return success;
}

async function generateKeys(name, email) {
    var newKey = await new Promise(resolve => {
        fs.mkdtemp(path.join(os.tmpdir(), 'pk'), (err, folder) => {
            if (err) {
                err;
            }

            // 10 year expiration date
            var years = 10
            var expiration = new Date(new Date().setFullYear(new Date().getFullYear() + years)).toISOString().slice(0, 10);

            // create master key
            var createdKey = key.createPrivateKey(folder, name, email, expiration)

            resolve(createdKey)
        });
    });

    return newKey;
}

async function ensureDependencies() {

    // check brew
    var pass = await new Promise(resolve => {
        exec('HOMEBREW_NO_AUTO_UPDATE=1 brew --version', (err, stdout, stderr) => {
            if(err) 
                logger.error("Homebrew not found. \n" + err)
            resolve(stdout.includes("homebrew-core"))
        })
    })

    if(!pass)
        return false;

    // check yubikey dependencies
    pass = await new Promise(resolve => {
        exec('HOMEBREW_NO_AUTO_UPDATE=1 brew install gnupg', (err, stdout, stderr) => {
            if(err)
                logger.error("Error with dependencies. \n" + err)

            // this often will give error if packages are already installed that need to be updated.
            resolve(true)
        })
    })

    if(!pass)
        return false;

    return true;
}

async function getYubikey() {
    var found = await new Promise(resolve => {
        exec('gpg --card-status', (err, stdout, stderr) => {
            if(err)
                logger.error(err)
            resolve(stdout.includes("Serial number"));
        })
    });
    return found
}

async function getGPG() {
    var found = await new Promise(resolve => {
        exec('gpgconf', (err, stdout, stderr) => {
            if(err)
                logger.error(err)
            resolve(stdout.includes("gpg-agent"));
        })
    });
    return found
}

// returns e.g.: John Smith
async function getFullUsername() {
    var name = new Promise(resolve => {
        exec("finger $(whoami) | egrep -o 'Name: [a-zA-Z0-9 ]{1,}' | cut -d ':' -f 2 | xargs echo", function(err, stdout, stderr) {
            if(err) {
                resolve(null)
                return;
            }
            var name = stdout.trim();
            resolve(name)
        })
    })
    return name
}

module.exports.registerIpc = registerIpc
module.exports.getYubikey = getYubikey