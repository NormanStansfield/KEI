const shelljs = require('shelljs')
shelljs.config.globOptions = {nodir: true}

const exiftool = require('node-exiftool')
const exiftoolBin = require('dist-exiftool')

import * as m from "mithril"

// internal data structure for selected jpeg file
export class ImgFileInfo  {
  readonly checked: Mithril.BasicProperty<boolean>
  readonly file: Mithril.BasicProperty<any>
  readonly iptc: Mithril.BasicProperty<any>

  constructor(flag: boolean, fsstats, iptc) {
    this.checked = m.prop(flag)
    this.file = m.prop(fsstats)
    this.iptc = m.prop(iptc)
  }
}

// model
export class AppModel {
  readonly HOME_DIR: string
  private _currentDir: Mithril.BasicProperty<string>
  readonly cwdFiles: Mithril.BasicProperty<Array<ImgFileInfo>>

  readonly settings: {
    isRemoveAll: Mithril.BasicProperty<boolean>,
    isOverwriteKeywords: Mithril.BasicProperty<boolean>,
    isIgnoreMinorErr: Mithril.BasicProperty<boolean>,
    separatorIdx: Mithril.BasicProperty<number>
  }
  readonly msg2footer: {
    msg: Mithril.BasicProperty<string>,
    color: Mithril.BasicProperty<string>
  }

  private _ep
  private _et

  readonly sepArray: [
    string[]
  ]

  constructor() {
    // separators
    // Format: option, value
    this.sepArray = [
      ['Comma', ','],
      ['Semi-colon', ';']
    ]

    shelljs.cd()
    this.HOME_DIR = shelljs.pwd().toString()

    // working directory
    this._currentDir = m.prop(this.HOME_DIR)

    // store selected files info
    this.cwdFiles = m.prop(new Array())

    // application settings
    this.settings = {
      isRemoveAll: m.prop(false),
      isOverwriteKeywords: m.prop(false),
      isIgnoreMinorErr: m.prop(true),
      separatorIdx: m.prop(0)
    }

    // message to footer
    this.msg2footer = {
      msg: m.prop(''),
      color: m.prop('')
    }

    // load previous working directory from local storage
    let tmp = JSON.parse(localStorage.getItem('appcwd'));
    console.log('appcwd ' + JSON.stringify(tmp))
    if(tmp != null) {
      this._currentDir(tmp)
    }

    // load settings from local storage
    this.loadSettings()

    // ExifTool settings
    this._ep = new exiftool.ExiftoolProcess(exiftoolBin)
    this._et = this._ep.open()
    this._ep.on(exiftool.events.EXIT, () => {
      console.log('exiftool process exited. Restart...')
      this._et = this._ep.open()
    })
  }

  get ep() {
    return this._ep;
  }

  get et() {
    return this._et;
  }

  currentDir = (dir?: string) => {
    if(dir) {
      this._currentDir(dir)
      console.log('appcwd ', dir)
      localStorage.setItem('appcwd', JSON.stringify(this._currentDir));
    }

    return this._currentDir()
  }

  saveSettings = () => {
    localStorage.setItem('appsetting', JSON.stringify(this.settings));
  }

  loadSettings = () => {
    let tmp = JSON.parse(localStorage.getItem('appsetting'));

    if(tmp != null) {
      this.settings.isRemoveAll(tmp.isRemoveAll)
      this.settings.isOverwriteKeywords(tmp.isOverwriteKeywords)
      this.settings.isIgnoreMinorErr(tmp.isIgnoreMinorErr)
      this.settings.separatorIdx(tmp.separatorIdx)
    }
    console.log('appsetting ' + JSON.stringify(this.settings))
  }

}

