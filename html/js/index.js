
setTimeout(function() {
    var $iframe = $('#index');



    // Generate index id's
    $(".index-box", $iframe.contents()).find(".index-option").each(function() {
        $(this).attr('id', guidGenerator());
    })

    // On index item click
    $(".index-box", $iframe.contents()).on("click", ".index-option", function() {
        var $box = $(this).closest(".index-box").first();
        var $wrapper = $($box).children("ul").first();
        var item = this;
        var index = 0;

        $($wrapper).find(".index-option").each(function(index, element) {
            if($(element).attr('id') == $(item).attr('id')) {
                slider.goToSlide(index);
                return false;
            }
            index++
        })
    });

    var sliding = false
    for(var button = 0; button < 10; button++) {
        const val = button;
        Mousetrap.bind(`${val}`, function() { 
            if(sliding)
                return;
            slider.goToSlide(val-1); 
            sliding = true
            setTimeout(function(){sliding = false}, 650)
        });
    }

    // Pre-load
}, 1000)

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}