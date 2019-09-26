const { exec } = require('child_process');
var sudo = require('sudo-prompt');

// Launch script MacOS
// https://medium.com/@fahimhossain_16989/adding-startup-scripts-to-launch-daemon-on-mac-os-x-sierra-10-12-6-7e0318c74de1

var template = `
    <?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
    <plist version="1.0">
        <dict>
            <key>Label</key>
            <string>com.radixdlt.radixonboard</string>

            <key>ProgramArguments</key>
            <array>
                <string>/usr/bin/open</string>
                <string>-a</string>
                <string>radix-onboard</string>
            </array>
            
            <key>KeepAlive</key>
            <true/>
        </dict>
    </plist>
`

function createPlist() {
    // prompt sudo if needed
    var command = `echo "${template}" > ~/Library/LaunchAgents/com.radixdlt.radixonboard.plist`

    exec(command, (err, stdout, stderr) => {
        if (err) throw err;
        console.log('stdout: ' + stdout);
    });
}

module.exports.createPlist = createPlist
