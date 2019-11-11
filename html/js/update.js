const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
const closeButton = document.getElementById('close-button');
var progressbar;

$(document).ready(function(){

    // Get app version
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
        ipcRenderer.removeAllListeners('app_version');
        document.title = "Guide " + arg.version;
    });
    ipcRenderer.on('download_progress', (event, progress) => {
        showProgressbar()
        message.innerText = `Downloading update`;
        updateProgressBar(progress);
        notification.classList.remove('hidden');
        restartButton.classList.add('hidden');
        closeButton.classList.add('hidden');
    })
    ipcRenderer.on('update_available', () => {
        ipcRenderer.removeAllListeners('update_available');
        message.innerText = 'A new update has been detected. Downloading...';
        notification.classList.remove('hidden');
    });
    ipcRenderer.on('update_downloaded', () => {
        ipcRenderer.removeAllListeners('update_downloaded');
        showProgressbar(false)
        message.innerText = 'Update downloaded. It will be installed on restart. Would you like to restart?';
        restartButton.classList.remove('hidden');
        closeButton.classList.remove('hidden');
        notification.classList.remove('hidden');
    });



    
});

function closeNotification() {
    notification.classList.add('hidden');
}

function restartApp() {
    ipcRenderer.send('restart_app');
}


function showProgressbar(show) {
    if(show == undefined)
        show = true

    if(show == true)
        $("#progress-bar").removeClass("hidden")
    else
        $("#progress-bar").addClass("hidden")
}

var increasing = 0
function updateProgressBar(value) {
    var elem = document.getElementById("inner-progress-bar");
    var width = parseInt(elem.style.width) || 10;
    
    if (increasing == 0) {
        increasing = 1;
        var id = setInterval(() => {
            if (width >= value) {
                clearInterval(id);
                increasing = 0;
            }
            else {
                width++;
                elem.style.width = width + "%";
                elem.innerHTML = width + "%";
            }
        }, 10);
    }
}