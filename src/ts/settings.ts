import * as m from "mithril"

import {ImgFileInfo, AppModel} from "./appmodel"


// controller
class SettingsController implements Mithril.Controller {
  constructor() {
  }
}


// component
export class SettingsComponent implements Mithril.Component<SettingsController> {
  controller: () => SettingsController
  view: (ctrl?: Mithril.Controller, ...args: any[]) => Mithril.VirtualElement
  vm: AppModel

  constructor(model) {
    this.controller = () => {
      const ctrl = new SettingsController()
      return ctrl
    }

    this.vm = model
    this.view = this.viewSettings
  }


  // view
  viewSettings = (ctrl) => {
    return m(".pane", {style: {"background-color": "#f0f0f0", "word-wrap": "break-word"}},
      m(".form-group.padded-more",
        m(".form-group",
          [
            m(".checkbox.form-control",
              [
                m("label",
                  [
                    m("input[type='checkbox']", {onchange: m.withAttr("checked", (value) => {this.vm.settings.isRemoveAll(value);this.vm.saveSettings()}), checked: this.vm.settings.isRemoveAll() }),
                    m("span",
                      "Remove all existing tags"
                    )
                  ]
                ),
                m("p",
                  "Remove all existing tags before added Title and keywords"
                )
              ]
            ),
            m(".checkbox.form-control",
              [
                m("label",
                  [
                    m("input[type='checkbox']", {onchange: m.withAttr("checked", (value) => {this.vm.settings.isOverwriteKeywords(value);this.vm.saveSettings()}), checked: this.vm.settings.isOverwriteKeywords() }),
                    m("span",
                      "Overwrite existing Keywords"
                    )
                  ]
                ),
                m("p",
                  "Remove all existing Keywords before added Keywords"
                )
              ]
            ),
            m(".form-control",
              [
                m("span[class='']",
                  "Separator"
                ),
                m("span[class='']",
                  m("select[class='']", {onchange: m.withAttr('selectedIndex', (selectedIndex) => {this.vm.settings.separatorIdx(selectedIndex);this.vm.saveSettings()}), selectedIndex: this.vm.settings.separatorIdx()},
                    [
                       this.vm.sepArray.map((elm, index) => {
                        return m("option", {selected: this.vm.settings.separatorIdx() === index}, elm[0])
                      })
                    ]
                  )
                ),
                m("p",
                  "Keywords string separator. Choose comma or semi-colon"
                )
              ]
            ),
            m(".checkbox.form-control",
              [
                m("label",
                  [
                    m("input[type='checkbox']", {onchange: m.withAttr("checked", (value) => {this.vm.settings.isIgnoreMinorErr(value);this.vm.saveSettings()}), checked: this.vm.settings.isIgnoreMinorErr() }),
                    m("span",
                      "Ignore Minor Error : Exiftool Option"
                    )
                  ]
                ),
                m("p",
                  "Ignore Minor Error of Exiftool. If set OFF, minor error message is in title field"
                )
              ]
            )
          ]
        )
      )
    )
  }


}
