const path = require('path')
const url = require('url')

const electron = require('electron')
const {remote} = electron
const {BrowserWindow} = remote

import * as m from 'mithril'

import {ImgFileInfo, AppModel} from './appmodel'

// Preview image window width
const BASEWIDTH = 450

// controller
class MainWController implements Mithril.Controller {
  constructor() {}
}

// component
export class MainWComponent implements Mithril.Component<MainWController> {
  controller: () => MainWController
  view: (ctrl?: Mithril.Controller, ...args: any[]) => Mithril.VirtualElement
  vm: AppModel

  constructor(model) {
    this.controller = () => {
      const ctrl = new MainWController()
      return ctrl
    }

    this.vm = model
    this.view = this.viewMainW
  }

  onclickFilename = (filename) => {
    const width = BASEWIDTH
    const height = 9 / 16 * BASEWIDTH

    const filepath = url.format({
      pathname: path.join(this.vm.currentDir(), filename),
      protocol: 'file:',
      slashes: true,
    })

    let previeWin = new BrowserWindow({
      width: width,
      height: height,
      frame: false,
    }) // frameless window
    previeWin.loadURL(filepath)
    previeWin.on('blur', () => {
      console.log('previeWin')
      console.log(previeWin.id)
      BrowserWindow.fromId(previeWin.id).close()
      previeWin = null
    })
  }

  // view
  viewMainW = (ctrl) => {
    return m(
      '.window-content#mainwindow-pane',
      m('.pane-group', [
        m(
          '.pane-sm.sidebar',
          {style: {'min-height': '1000%', height: '100%'}},
          m('nav.nav-group', [
            m('p.nav-group-title.text-center', 'Selected'),
            this.vm
              .cwdFiles()
              .filter((elm) => {
                return elm.checked()
              })
              .map((element: ImgFileInfo) => {
                return m('p.nav-group-item', [
                  m(
                    'span#selected_file',
                    {style: {'font-size': '80%'}},
                    element.file().name ? element.file().name : 'Empty'
                  ),
                  m('br'),
                  m(
                    'span#ObjectName',
                    element.iptc().ObjectName
                      ? element.iptc().ObjectName
                      : 'Empty'
                  ),
                  m('br'),
                  m(
                    'strong#Keywords',
                    element.iptc().Keywords
                      ? new Array(element.iptc().Keywords).join()
                      : 'Empty'
                  ),
                  m('hr'),
                ])
              }),
          ])
        ),
        m(
          '.pane',
          m(
            'table.table-striped',
            m("colgroup[span='1']", {style: {width: '3em'}}),
            [
              m(
                'thead',
                m('tr', [
                  m('th', ' '),
                  m('th', 'Name'),
                  m('th', 'Time Stamp'),
                  m('th', 'File Size'),
                ])
              ),
              m('tbody#filelist', [
                this.vm.cwdFiles().map((element: ImgFileInfo) => {
                  return m('tr', [
                    m(
                      'td#tick-file',
                      {
                        onclick: () => {
                          element.checked(!element.checked())
                        },
                      },
                      m("input[type='checkbox']", {checked: element.checked()})
                    ),
                    m(
                      'td#filename',
                      {
                        onclick: m.withAttr('textContent', (value) => {
                          console.log(value)
                          this.onclickFilename(value)
                        }),
                      },
                      element.file().name
                    ),
                    m('td', element.file().mtime),
                    m('td', element.file().size),
                  ])
                }),
              ]),
            ]
          )
        ),
      ])
    )
  }
}
