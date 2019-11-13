const { exec } = require('child_process');
const fs = require('fs')
const tmp = require('tmp');
const path = require('path');
const log4js = require('log4js');
const yubikey = require('./yubikey');
const logger = log4js.getLogger('app'); 
const compile = require("string-template/compile")

let defaultKeys = [
    "https://keybase.io/jamesrdx/pgp_keys.asc",
    "https://keybase.io/zalan/pgp_keys.asc",
    "https://keybase.io/radix_sophie/pgp_keys.asc"
]

let gpgConfig = `
    personal-cipher-preferences AES256 AES192 AES
    personal-digest-preferences SHA512 SHA384 SHA256
    personal-compress-preferences ZLIB BZIP2 ZIP Uncompressed
    default-preference-list SHA512 SHA384 SHA256 AES256 AES192 AES ZLIB BZIP2 ZIP Uncompressed
    cert-digest-algo SHA512
    s2k-digest-algo SHA512
    s2k-cipher-algo AES256
    charset utf-8
    fixed-list-mode
    no-comments
    no-emit-version
    keyid-format 0xlong
    list-options show-uid-validity
    verify-options show-uid-validity
    with-fingerprint
    require-cross-certification
    no-symkey-cache
    throw-keyids
    use-agent`

let pkConfig = compile(`
    Key-Type: 1
    Key-Length: 4096
    Key-Usage: sign
    Subkey-Type: 1
    Subkey-Length: 4096
    Subkey-Usage: encrypt
    Name-Real: {0}
    Name-Email: {1}
    Expire-Date: {2}
    Passphrase: {3}`)


async function createConfig(directory) {
    var file = path.join(directory, "gpg.conf")
    var success = new Promise(resolve => {
        fs.writeFile(file, gpgConfig, (err) => {
            if (err) {
                logger.error(err)
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    })
    return success
}

async function generatePassword() {
    
    var password = await new Promise(resolve => {
        exec(`${yubikey.getCommandPrefix()}gpg --gen-random -a 0 16`, (err, stdout, stderr) => {
            if(err) {
                logger.error(err)
                resolve(null);
            }
            else {
                resolve(stdout.trim());
            }
        })
    });

    return password
}

async function createKeyFile(name, email, expiration, password) {
 
    // render data
    var data = pkConfig(name, email, expiration, password)

    // create keys
    var fingerprint = await new Promise(resolve => {
        tmp.file(function (err, path, fd, cleanupCallback) {
            if(err) {
                logger.error(err)
                resolve(false);
                return;
            }
        
            // write file 
            fs.writeFileSync(path, data)

            // generate master key
            exec(`${yubikey.getCommandPrefix()}gpg --batch --generate-key ${path}`, (err, stdout, stderr) => {
                if(err) {
                    logger.error(err)
                    resolve(false);
                    return;
                }

                // it prints to stderr
                if(stderr.includes("trusted")) {

                    // key fingerprint
                    var fingerprint = stderr.substring(
                        stderr.lastIndexOf(".d/")+3, 
                        stderr.lastIndexOf(".rev")
                    );

                    // generate subkeys

                    // sign
                    exec(`${yubikey.getCommandPrefix()}gpg --batch --pinentry-mode loopback --passphrase="${password}" --yes --quick-add-key "${fingerprint}" rsa4096 sign "${expiration}"`, (err, stdout, stderr) => {
                        if(err) {
                            logger.error(err)
                            resolve(false);
                            return;
                        }

                        // auth
                        exec(`${yubikey.getCommandPrefix()}gpg --batch --pinentry-mode loopback --passphrase="${password}" --yes --quick-add-key "${fingerprint}" rsa4096 auth "${expiration}"`, (err, stdout, stderr) => {
                            if(err) {
                                logger.error(err)
                                resolve(false);
                                return;
                            }
    
                            resolve(fingerprint);
                        });
                    });
                }
                else
                    resolve(false);
            })
        });
    });

    return fingerprint;
}

async function createPrivateKey(directory, name, email, expiration) {

    // config
    var success = await createConfig(directory)
    if(!success) {
        return null;
    }

    // password
    var password = await generatePassword()
    if(password == null) {
        return null;
    }

    // key file
    var fingerprint = await createKeyFile(name, email, expiration, password);
    if(fingerprint == false) {
        return null;
    }

    return {fingerprint: fingerprint, password: password};
}

async function importDefaultKeys() {
    var count = 0;
    defaultKeys.forEach(function(key) {
        var imported = new Promise(resolve => {
            exec(`curl ${key} | gpg --import`, (err, stdout, stderr) => {
                if(err) {
                    logger.error(`Error importing ${key} \n${err}`)
                    resolve(false)
                    return;
                }
                resolve(stdout.includes("processed"))
            });
        })
        if(imported)
            count++
    })
    return count
}

module.exports.importDefaultKeys = importDefaultKeys
module.exports.createPrivateKey = createPrivateKey