
setTimeout(function() {
    var $iframe = $('#yubikey_setup');
    var $console = $("#yubikey-console", $iframe.contents());

    // On refresh yubikeys
    $("#generate-key-button", $iframe.contents()).on("click", function() {
        ipcRenderer.send('generate-key', null)
    });

    // copy passphrase button
    $("#passphrase-button", $iframe.contents()).on("click", function() {
        ipcRenderer.send('passphrase-button')
    })

    // copy to yubikey button
    $("#copy-to-yubikey-button", $iframe.contents()).on("click", function() {
        ipcRenderer.send('copy-to-yubikey-button')
    })

    

    // yubikey form
    $("#yubikey-form").submit(function(e) {

        // confirm
        if(confirm("Are you sure you want to save these details?")) {

            // get data
            var data = getFormData($(this));

            // send data back
            ipcRenderer.send('yubikey-form', data)
        }
        e.preventDefault();
    })

    // yubikey close form
    $("#yk-form-close").on("click", function() {
        var window = remote.getCurrentWindow();
        ipcRenderer.send('yubikey-form-cancel')
        window.close();
    })

    // ipcRenderer
    ipcRenderer.on('console-message', (event, message) => {
        addConsoleMessage($console, message)
    })
    ipcRenderer.on('enable-button', (event, element, enable) => {
        var $button = $(element, $iframe.contents())
        enableDomElement($button, enable)
    })

}, 1000)


function addConsoleMessage($console, message) {
    $($console).append("<option selected>"+message+"</option>")

    // scroll to bottom
    var optionTop = $console.find('option').last().offset().top;
    var selectTop = $console.offset().top;
    $console.scrollTop($console.scrollTop() + (optionTop - selectTop));
}

function getFormData($form) {
    var unindexed_array = $form.serializeArray();
    var data = {};

    $.map(unindexed_array, function(n, i){
        data[n['name']] = n['value'];
    });

    return data;
}

function enableDomElement($element, enable) {
    if(enable == undefined)
        enable = true;
    
    if($element)
        $($element).prop("disabled", !enable);
}