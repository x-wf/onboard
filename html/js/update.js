const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');
const closeButton = document.getElementById('close-button');
var progressbar;

$(document).ready(function(){


    // Progress bar
    initializeProgressbar();

    // Get app version
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
        ipcRenderer.removeAllListeners('app_version');
        document.title = "Guide " + arg.version;
    });
    ipcRenderer.on('download_progress', (event, progress) => {
        showProgressbar()
        message.innerText = ``;
        progressbar.animate(progress/100);
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

function initializeProgressbar() {
    progressbar = new ProgressBar.Line("#update_progressbar", {
        strokeWidth: 4,
        easing: 'easeInOut',
        duration: 1400,
        color: '#78d378',
        trailColor: '#eee',
        trailWidth: 1,
        svgStyle: {width: '100%', height: '100%'},
        text: {
            style: {
                // Text color.
                // Default: same as stroke color (options.color)
                color: '#999',
                position: 'absolute',
                right: '0',
                top: '30px',
                padding: 0,
                margin: 0,
                transform: null
            },
            autoStyleContainer: false
        },
        from: {color: '#78d378'},
        to: {color: '#78d378'},
        step: (state, bar) => {
            bar.setText(Math.round(bar.value() * 100) + ' %');
        }
    });
}

function showProgressbar(show) {
    if(show == undefined)
        show = true

    if(show == true)
        $("#update_progressbar").removeClass("hidden")
    else
        $("#update_progressbar").addClass("hidden")
}