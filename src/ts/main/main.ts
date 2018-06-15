const env = process.env.NODE_ENV || 'production'
const isProduction = env !== 'development'

const electron = require('electron')
const {app, BrowserWindow} = electron

const path = require('path')
const url = require('url')

let mainWindow

const createWindow = () => {
  mainWindow = new BrowserWindow({width: 900, height: 600})
  // mainWindow = new BrowserWindow({width: 900, height: 600, webPreferences: { nodeIntegration: false}})

  if (isProduction) {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(
          electron.app.getAppPath(),
          'released',
          'index.html'
        ),
        protocol: 'file:',
        slashes: true,
      })
    )
  } else {
    mainWindow.loadURL('http://localhost:4444/released')
    // Open the DevTools
    mainWindow.webContents.openDevTools()
  }

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

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow()
  }
})
