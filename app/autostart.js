const { app } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const log4js = require('log4js');
const logger = log4js.getLogger("app");

// Launch script MacOS
// https://medium.com/@fahimhossain_16989/adding-startup-scripts-to-launch-daemon-on-mac-os-x-sierra-10-12-6-7e0318c74de1

// Load task to launchctl manually: 
// launchctl load -w ~/Library/LaunchAgents/com.radixdlt.radixonboard.plist

var plist = "com.radixdlt.radixonboard.plist"
var template = `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>Label</key>
        <string>com.radixdlt.macos.radix-onboard</string>

        <key>ProgramArguments</key>
        <array>
            <string>/usr/bin/open</string>
            <string>-a</string>
            <string>Radix Onboard</string>
        </array>
        <key>StandardOutPath</key>
        <string>/tmp/radix-onboard.log</string>
        <key>StandardErrorPath</key>
        <string>/tmp/radix-onboard.log</string>
        <key>Debug</key>
        <true/>
        <key>RunAtLoad</key>
        <true/>
    </dict>
</plist>
`

function createAgent() {
    var home = app.getPath('home');
    var file = path.join(home, 'Library', 'LaunchAgents', plist)

    // write agent
    try { 
        fs.writeFileSync(file, template, 'utf-8'); 
        console.log(`Successfully written to ${file}`);
    }
    catch(error) { 
        logger.error(`Failed write to ${file}\n` + error)
        console.log(`Failed write to ${file}`);
    }

    // activate agent
    console.log("Activating in launchctl")
    exec(`launchctl load -w ${file}`, (error, stdout, stderr) => {
        if(error) 
            logger.error(`Unable to register in launchctl the file ${file}\n` + error)
        else
            console.log(`Successfully registered in launchctl the file ${file}.`)
    })
}

module.exports.createAgent = createAgent
