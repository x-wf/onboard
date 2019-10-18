
setTimeout(function() {
    var $iframe = $('#index');



    // On refresh yubikeys
    $(".index-option", $iframe.contents()).on("click", function() {
        console.log(".index-option clicked")
    });

    // Pre-load
}, 1000)