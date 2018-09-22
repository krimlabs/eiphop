const {app, BrowserWindow} = require('electron');
let win;
function createWindow () {
  win = new BrowserWindow({
    width: 800, height: 600, transparent: false,
    webPreferences: {
      nodeIntegration: false,
      preload: __dirname + '/preload.js' // <--- (1) Preload script
  }});
win.loadURL('http://localhost:3000'); // <--- (2) Loading react
  
win.webContents.openDevTools();
win.on('closed', () => {  
    win = null
  });
}
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})