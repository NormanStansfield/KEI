const path = require('path')
const url = require('url')

const electron = require('electron')
const {remote} = electron
const {BrowserWindow, dialog} = remote

import * as m from 'mithril'

import {ImgFileInfo, AppModel} from './appmodel'

// controller
class BatchModeController implements Mithril.Controller {
  constructor() {}
}

// component
export class BatchModeComponent
  implements Mithril.Component<BatchModeController> {
  controller: () => BatchModeController
  view: (ctrl?: Mithril.Controller, ...args: any[]) => Mithril.VirtualElement
  vm: AppModel

  title: Mithril.BasicProperty<string>
  keywords: Mithril.BasicProperty<string>

  constructor(model) {
    this.controller = () => {
      const ctrl = new BatchModeController()
      return ctrl
    }

    this.title = m.prop('')
    this.keywords = m.prop('')

    this.vm = model
    this.view = this.viewBatchMode
  }

  onclickReset = () => {
    this.title('')
    this.keywords('')
  }

  onclickOK = async () => {
    // Config data with value
    const data = {}
    // Config data without value
    const etOps = []

    m.startComputation()

    // Settings

    // Remove All existing tags
    if (this.vm.settings.isRemoveAll()) {
      data['all'] = ''
    }

    if (this.title().length > 0) {
      data['ObjectName'] = this.title()
    }

    if (this.keywords().length > 0) {
      let sep = this.vm.sepArray[this.vm.settings.separatorIdx()][1].toString()
      let tmp = this.keywords().split(sep)

      // Keywords writing mode
      if (this.vm.settings.isOverwriteKeywords()) {
        // Overwrite mode
        data['Keywords'] = tmp
      } else {
        // Append mode
        data['Keywords+'] = tmp
      }
      // Use UTF8 CHARSET
      data['CodedCharacterSet'] = 'UTF8'
    }

    // Exiftool option without value
    if (this.vm.settings.isIgnoreMinorErr()) {
      etOps.push('ignoreMinorErrors')
    }

    // ExifTool response
    const status = []
    const errRegExp = /^Error:/

    const promiseAry = this.vm
      .cwdFiles()
      .filter((elm) => {
        return elm.checked()
      })
      .map(async (fsstats: ImgFileInfo) => {
        const filepath = path.join(this.vm.currentDir(), fsstats.file().name)

        await this.vm.et
          .then(() => this.vm.ep.writeMetadata(filepath, data), etOps)
          .then((res) => {
            if (res.error.match(errRegExp)) {
              console.log(res.error)
              status.push(res.error)
            }
          })
          .catch((err) => {
            console.log(err)
            console.log('ERROR: onclickOK')
          })
      })

    await Promise.all(promiseAry)
    console.log('status ', status)

    if (status.length) {
      this.vm.msg2footer.color('red')
      this.vm.msg2footer.msg(status.toString())
    } else {
      this.vm.msg2footer.color('')
      this.vm.msg2footer.msg('All files Updated!')
    }

    m.endComputation()
  }

  // view
  viewBatchMode = (ctrl) => {
    return m(
      '.window-content',
      m('.pane-group#batchmode-pane', [
        m(
          '.pane',
          {style: {width: '100%', 'max-width': '520px'}},
          m(
            '.window',
            m(
              '.window-content',
              m('.padded-more', [
                m('.form-group', [
                  m('label', 'Title'),
                  m(
                    "input.form-control[autofocus=''][placeholder='Title'][size='100'][type='text']#title",
                    {
                      onchange: m.withAttr('value', this.title),
                      value: this.title(),
                    }
                  ),
                ]),
                m('.form-group', [
                  m('label', 'Keywords'),
                  m(
                    "input.form-control[placeholder='keywords with separator'][size='100'][type='text']#keywords",
                    {
                      onchange: m.withAttr('value', this.keywords),
                      value: this.keywords(),
                    }
                  ),
                ]),
                m('.form-action.pull-right', [
                  m(
                    "span[class='']",
                    {onclick: this.onclickReset},
                    m('button.btn.btn-large.btn-default#reset', [
                      m('span.icon.icon-cancel'),
                      m.trust('&nbsp;'),
                      'Reset',
                    ])
                  ),
                  m.trust('&emsp;'),
                  m(
                    "span[class='']",
                    {onclick: this.onclickOK},
                    m('button.btn.btn-large.btn-default#ok', [
                      m('span.icon.icon-check'),
                      m.trust('&nbsp;'),
                      'OK',
                      m.trust('&nbsp;'),
                      '!',
                    ])
                  ),
                ]),
              ])
            )
          )
        ),
        m(
          '.pane#selected-pane',
          m('table.table-striped', [
            m("colgroup[span='']", {style: {width: '3em'}}),
            m(
              'thead',
              m('tr', [
                m('th'),
                m('th', 'Name'),
                m('th', 'Time Stamp'),
                m('th', 'File Size'),
              ])
            ),
            m('tbody', [
              this.vm
                .cwdFiles()
                .filter((elm) => {
                  return elm.checked()
                })
                .map((element: ImgFileInfo) => {
                  return m('tr', [
                    m(
                      'td',
                      {
                        onclick: () => {
                          element.checked(!element.checked())
                        },
                      },
                      m("input[type='checkbox']", {checked: element.checked()})
                    ),
                    m('td', element.file().name),
                    m('td', element.file().mtime),
                    m('td', element.file().size),
                  ])
                }),
            ]),
          ])
        ),
      ])
    )
  }
}
