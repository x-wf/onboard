
setTimeout(function() {
    var $iframe = $('#yubikeys');
    var $counter = $("#yubikeys-count", $iframe.contents());
    
    // Get keys
    ipcRenderer.on('keys', (event, count) => {

        // html table

        // Number
        if(!isNaN(count)) {

            // Error getting keys
            if(count == -1) {
                console.log("Error while getting private keys on local machine.")
            }
            else {
                $($counter).text(count);
            }
        }
        else {
            // list, tree, map
        }
    })


    // On refresh yubikeys
    $("#refresh-yubikeys", $iframe.contents()).on("click", function() {
        $($counter).text("-");
        ipcRenderer.send('get-yubikeys', 'count')
    });

    // Pre-load
    ipcRenderer.send('get-yubikeys', 'count')
}, 1000)