const path = require('path')
const url = require('url')

const electron = require('electron')
const {
  remote
} = electron
const {
  BrowserWindow,
  dialog
} = remote

const shelljs = require('shelljs')
// choose only files
shelljs.config.globOptions = {nodir: true}

import * as m from "mithril"

import {ImgFileInfo, AppModel} from "./appmodel"

// controller
class ToolbarController implements Mithril.Controller {
  constructor() {
  }
}


// component
export class ToolbarComponent implements Mithril.Component<ToolbarController> {
  controller: () => ToolbarController
  view: (ctrl?: Mithril.Controller, ...args: any[]) => Mithril.VirtualElement
  vm: AppModel

  batchmode: Mithril.BasicProperty<boolean>
  settingmode: Mithril.BasicProperty<boolean>

  constructor(model) {
    this.controller = () => {
      const ctrl = new ToolbarController()
      return ctrl
    }

    // flag for screen changing
    this.batchmode = m.prop(false)
    this.settingmode = m.prop(false)

    this.vm = model
    this.view = this.viewToolbar

  }


  onclickHome = () => {
    m.startComputation()

    this.vm.currentDir(this.vm.HOME_DIR)
    shelljs.cd(this.vm.currentDir())
    this.vm.cwdFiles(this.getFiles(shelljs.ls('-l')))

    this.vm.msg2footer.color('')
    this.vm.msg2footer.msg('Changed to Home directory ' + this.vm.currentDir())

    m.endComputation()
  }


  getIPTC = (fstats) => {
    console.log(fstats)

    const filepath = path.join(this.vm.currentDir(), fstats.name)
    return new Promise((resolve, reject) =>{
      this.vm.et
      .then(() => this.vm.ep.readMetadata(filepath, ['Keywords', 'ObjectName']))
      .then((res) => {
        if (res.data && res.data[0].Error) { // if file format is wrong
          console.log(res.data[0].Error)
          resolve(res.data[0].Error)
        }else if (res.error) { // if ExifTool return error
          console.log(res.error)
          resolve(res.error)
        }else{ // Success
          console.log(res)
          resolve(res.data[0])
        }
      })
      .catch((err) => {
        console.log(err)
        reject('ERROR: getIPTC')
      })
    })
  }


  getFiles = (files: Array<any>): Array<ImgFileInfo> => {
    // filter only JPEG files
    const jpgRegExt = /.+\.(?=jpg$|jpeg$)/iu
    const filtered = new Array()

    m.startComputation()

    this.vm.msg2footer.color('')
    this.vm.msg2footer.msg(this.vm.currentDir())

    files.map ( async (element) => {
      if (element.isFile && element.name.match(jpgRegExt)) {
        let iptc
        await this.getIPTC(element)
        .then((res) => {
          if (typeof res === 'string') { // if response is string, get error message in getIPTC
            iptc = {ObjectName: res, Keywords: ''}
          }else { // get IPTC correctlly
            iptc = res
          }})
        .catch((err) => {
          console.log(err)
        })
        console.log('iptc ' + iptc)
        filtered.push( new ImgFileInfo(false, element, iptc))
      }

      m.endComputation()
    })

    return filtered
  }


  onclickFolder = () => {
    const currentDir = this.vm.currentDir

    m.startComputation()

    dialog.showOpenDialog(null, {
      properties: ['openDirectory'],
      title: 'Select Folder',
      defaultPath: currentDir()
    }, (folderName) => {
      if(!( typeof folderName === 'undefined' || folderName.length == 0 )) { // if choose folder
        console.log(folderName)
        currentDir(folderName.toString())
        console.log(currentDir())

        shelljs.cd(currentDir())
        this.vm.cwdFiles(this.getFiles(shelljs.ls('-l')))
        console.log(this.vm.cwdFiles())
        console.log(this.vm.cwdFiles().length)
      }
    })

    this.vm.msg2footer.color('')
    this.vm.msg2footer.msg(currentDir())

    m.endComputation()
  }


  onclickRefresh = () => {
    const currentDir = this.vm.currentDir

    m.startComputation()

    shelljs.cd(currentDir())
    this.vm.cwdFiles(this.getFiles(shelljs.ls('-l')))
    console.log(this.vm.cwdFiles())
    console.log(this.vm.cwdFiles().length)

    this.vm.msg2footer.color('')
    this.vm.msg2footer.msg('Refreshed ' + currentDir())

    m.endComputation()
  }


  onclickSetTags = () => {
    if (this.batchmode() ) {
      m.route('/');
      this.batchmode(false)

      this.vm.msg2footer.color('')
      this.vm.msg2footer.msg('')
    }else {
      m.route('/batchmode');
      this.batchmode(true)

      this.vm.msg2footer.color('')
      this.vm.msg2footer.msg('')
    }
  }


  onclickSettings = () => {
    if (this.settingmode() ) {
      m.route('/');
      this.settingmode(false)

      this.vm.msg2footer.color('')
      this.vm.msg2footer.msg('')
    }else {
      m.route('/settings');
      this.settingmode(true)

      this.vm.msg2footer.color('')
      this.vm.msg2footer.msg('')
    }
  }


  onclickAbout = () => {
    const filepath = url.format({
      pathname: path.join(__dirname, 'about.html'),
      protocol: 'file:',
      slashes: true
    })

    let aboutWin = new BrowserWindow ({width: 450, height: 200, resizable: false, frame: true })
    aboutWin.loadURL(filepath)
    aboutWin.on('blur', () => {
      console.log('aboutWin')
      console.log(aboutWin.id)
      BrowserWindow.fromId(aboutWin.id).close()
      aboutWin = null
    })
  }

  // view
  viewToolbar = (ctrl) => {
    return m("header.toolbar.toolbar-header",
      [
        m("h1.title",
          ""
        ),
        m(".toolbar-actions",
          [
            m(".btn-group",
              [
                m("button.btn.btn-default.btn-large", {onclick: this.onclickHome},
                  [
                    m("span.icon.icon-home"),
                    " Home"
                  ]
                ),

                m("button.btn.btn-default.btn-large", {onclick: this.onclickFolder},
                  [
                    m("span.icon.icon-folder"),
                    " Folder"
                  ]
                )
              ]
            ),
            m("button.btn.btn-default.btn-large", {onclick: this.onclickRefresh},
              [
                m("span.icon.icon-arrows-ccw"),
                " Refresh"
              ]
            ),
            m("button.btn.btn-default.btn-large", {class: this.batchmode() ? 'btn-primary' : '', onclick: this.onclickSetTags},
              [
                m("span.icon.icon-brush"),
                " Set Tags"
              ]
            ),
            m(".btn-group.pull-right",
              [
                m("button.btn.btn-default.btn-large", {class: this.settingmode() ? 'btn-primary' : '', onclick: this.onclickSettings},
                  [
                    m("span.icon.icon-cog"),
                    " Settings"
                  ]
                ),
                m("button.btn.btn-default.btn-large", {onclick: this.onclickAbout},
                  [
                    m("span.icon.icon-info-circled"),
                    " About"
                  ]
                )
              ]
            )
          ]
        )
      ]
    )
  }


}
