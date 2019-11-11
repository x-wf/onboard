var slider;
const notification = document.getElementById('notification');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

$(document).ready(function(){

    // Instanciate the "skeleton" for the pages to slide
    slider = $('.slider').bxSlider({
        infiniteLoop: false,
    });
 
    // Get app version
    ipcRenderer.send('app_version');
    ipcRenderer.on('app_version', (event, arg) => {
        ipcRenderer.removeAllListeners('app_version');
        document.title = "Guide " + arg.version;
    });
    ipcRenderer.on('download_progress', (event, progress) => {
        message.innerText = `Downloaded ${progress}%`;
        notification.classList.remove('hidden');
    })
    
    ipcRenderer.on('update_available', () => {
        ipcRenderer.removeAllListeners('update_available');
        message.innerText = 'A new update is available. Downloading now...';
        notification.classList.remove('hidden');
    });
    ipcRenderer.on('update_downloaded', () => {
        ipcRenderer.removeAllListeners('update_downloaded');
        message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
        restartButton.classList.remove('hidden');
        notification.classList.remove('hidden');
    });
    
});
function closeNotification() {
    notification.classList.add('hidden');
}
function restartApp() {
    ipcRenderer.send('restart_app');
}