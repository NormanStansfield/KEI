import * as m from "mithril"

import {ImgFileInfo, AppModel} from "./appmodel"

import {ToolbarComponent} from "./toolbar"
import {MainWComponent} from "./mainwindow"
import {BatchModeComponent} from "./batchmode"
import {SettingsComponent} from "./settings"
import {FooterComponent} from "./footer"

const model = new AppModel()

const toolbar = new ToolbarComponent(model)
const mainwindow = new MainWComponent(model)
const batchmode = new BatchModeComponent(model)
const settings = new SettingsComponent(model)
const footer = new FooterComponent(model)


// route
m.route(document.body, '/', {
  '/': {controller: null, view: () => {
    return m(".window",
      [
        toolbar,
        mainwindow,
        footer
      ]
    )
  }},
  '/settings': {controller: null, view: () => {
    return m(".window",
      [
        toolbar,
        settings,
        footer
      ]
    )
  }},
  '/batchmode': {controller: null, view: () => {
    return m(".window",
      [
        toolbar,
        batchmode,
        footer
      ]
    )
  }}
})

