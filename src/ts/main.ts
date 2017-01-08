const electron = require('electron')
const {
  app,
  BrowserWindow
} = electron

const path = require('path')
const url = require('url')

let mainWindow

// const client = require('electron-connect').client

const createWindow = () => {
  mainWindow = new BrowserWindow({width: 900, height: 600})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools
  // mainWindow.webContents.openDevTools()

  // For electron-connect
  // client.create(mainWindow);

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})
