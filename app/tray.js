const {app, Menu, Tray} = require('electron')
const childProc = require('child_process');
const path = require('path')
const yubikey = require('./yubikey.js');
const startWindow = require('./windows/start.js');


tray = null;

async function createTray() {

    tray = new Tray(path.join(__dirname, '../html/img/radix-icon-16x16-circle.png'))
    contextMenu = await generateTemplate();

    tray.setContextMenu(contextMenu)
}

async function generateTemplate() {

  return Menu.buildFromTemplate([

    // Yubikey
    {
      label: `Yubikey plugged in: ${await yubikey.getYubikey() ? "Yes" : "No"}`,
      enabled: false,
    },
    {type: "separator"},

    // Help
    {
      label: "Open Guide", click: (item, window, event) => {
        startWindow.createWindow(app)
      },
    },
    {
      label: "Help", click: (item, window, event) => {
        childProc.exec('open -a "Google Chrome" https://radixdlt.atlassian.net/servicedesk/customer/portal/3/group/5/create/17');
      },
    },
    {
      type: "separator"
    },

    // Quit
    {role: "quit"}
  ])
}

module.exports.createTray = createTray