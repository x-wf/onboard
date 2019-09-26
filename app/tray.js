const {Tray} = require('electron')
const path = require('path')

function createTray() {
    tray = new Tray(path.join(__dirname, '../html/img/radix-icon-28x28-circle.png'))
    tray.on('right-click', function(){})
    tray.on('double-click', function(){})
    
    tray.on('click', function (event) {
      // Do stuff
    })
}


module.exports.createTray = createTray