const { exec } = require('child_process');
const { clipboard } = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');
const key = require('./key.js');
const start = require('./windows/start.js');
const ykform = require('./windows/yubikey_form.js');
const log4js = require('log4js');
const logger = log4js.getLogger("app"); 

passphrase = "";

function registerIpc(ipcMain) {

    // receive signal from UI
    ipcMain.on('generate-key', async (event, arg) => {

        event.reply('console-message', "Checking Homebrew...")
        logger.info("Checking homebrew")
        // check dependencies
        var found = await ensureDependencies()
        if(!found) {
            event.reply('console-message', "Problems with Homebrew. Check /tmp/radix-onboard.log for more information.")
            return;
        }

        event.reply('console-message', "Brew found, dependencies were ensured to be installed.")
        event.reply('console-message', "Checking if GPG available on your system is available.")

        // check GPG
        var found = await getGPG();
        if(!found) {
            event.reply('console-message', "GPG doesn't seem to be available on your system... Please try again.")
            return;
        }

        event.reply('console-message', "GPG is available.")
        event.reply('console-message', "Checking yubikey...")

        // check yubikey

        event.reply('console-message', "Yubikey found.")
        event.reply('console-message', "Details for the private key have been requested.")

        // open form
        ykform.createWindow(start.getWindow())
    })

    // yubikey form
    ipcMain.on('yubikey-form', async (event, data) => {

        // generate
        start.getWindow().send('console-message', "Generating keys, please wait.")
        passphrase = await generateKeys(data.first_name + " " +data.last_name, data.email)
        
        // hide
        ykform.destroyWindow()

        // output
        start.getWindow().send('console-message', "Key generated successfully.")
        start.getWindow().send('console-message', `NOTE: Use the Copy Passphase button to copy your passphrase somewhere safe. It's unrecoverable!`)

        start.getWindow().send('passphrase-button', true)
    });

    // copy passphrase
    ipcMain.on('passphrase-button', async (event, data) => {
        
        start.getWindow().send('console-message', "Passphrase copied to clipboard.")
        clipboard.writeText(passphrase, 'selection');
        delete passphrase;
        
        // disable
        start.getWindow().send('passphrase-button', false)
    });
}


async function generateKeys(name, email) {
    var password = await new Promise(resolve => {
        fs.mkdtemp(path.join(os.tmpdir(), 'pk'), (err, folder) => {
            if (err) {
                err;
            }

            // 10 year expiration date
            var years = 10
            var expiration = new Date(new Date().setFullYear(new Date().getFullYear() + years)).toISOString().slice(0, 10);

            // create master key
            var password = key.createPrivateKey(folder, name, email, expiration)

            // create subkeys
            resolve(password)
        });
    });

    return password;
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


module.exports.registerIpc = registerIpc