import * as m from 'mithril'

import {ImgFileInfo, AppModel} from './appmodel'

// controller
class FooterController implements Mithril.Controller {
  constructor() {}
}

// component
export class FooterComponent implements Mithril.Component<FooterController> {
  controller: () => FooterController
  view: (ctrl?: Mithril.Controller, ...args: any[]) => Mithril.VirtualElement
  vm: AppModel

  constructor(model) {
    this.controller = () => {
      const ctrl = new FooterController()
      return ctrl
    }

    this.vm = model
    this.view = this.viewFooter
  }

  // view
  viewFooter = (ctrl) => {
    return m(
      'footer.toolbar.toolbar-footer',
      m(
        'h1.title.pull-left.padded-less',
        {style: {color: this.vm.msg2footer.color()}},
        [
          m('#footer-status', [
            m.trust('&emsp;'),
            'Status:',
            m.trust('&emsp;'),
            this.vm.msg2footer.msg(),
          ]),
        ]
      )
    )
  }
}
