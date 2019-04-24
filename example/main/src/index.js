const electron = require('electron');
const {app, BrowserWindow} = electron;
const {setupMainHandler} = require('eiphop');

const hipActions = {  
  hip: async (req, res) => {  
    const {payload} = req;  
    await sleep(800);
    //await new Promise(done => setTimeout(done, 800));
    res.send({msg: 'hop-' + Date()});

    // or res.error({msg: 'failed'})  
  }  
};

const pingActions = {  
  ping: (req, res) => {  
    const {payload} = req;  
    res.send({msg: 'pong-' + Date()});  
    // or res.error({msg: 'failed'})
  }  
};

setupMainHandler(electron, {...hipActions, ...pingActions}, true);

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