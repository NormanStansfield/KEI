import test from 'ava';
import iptc from 'node-iptc';
import randomatic from 'randomatic';
import shelljs from 'shelljs';
import {Application} from 'spectron';
import fake_dialog from 'spectron-fake-dialog';
//import {proxy} from 'proxyrequire'
import * as sinon from 'sinon';
const electron = require('electron');
const path = require('path')

const work = {}

const reset = () => {
  work.testdir = new Array()
}

// make folder with tesing image files
const prepare = () => {
  const testdir = path.join(__dirname, randomatic('a0',8))  // a-z,numeric 8 length
  shelljs.mkdir(testdir)
  work.testdir.push(testdir)
  return testdir.toString()
}

// copy jpeg files for testing
const copyjpg = (dir, dist) => {
  const src = path.join(__dirname, 'images', dir, '*')
  shelljs.cp(src, dist)
}

test.beforeEach(async t => {
  t.context.app = new Application({
//    path: path.join(__dirname,'..', 'node_modules','electron','cli.js'),
    path: electron,
    // env: { NODE_ENV: 'test' },
    args: [path.join(__dirname, '..')]
  });

  fake_dialog.apply(t.context.app)
  await t.context.app.start()

});

test.afterEach.always(async t => {
  await t.context.app.stop();
});

test.before(async t => {
 await reset()
});

test.after.always(async t => {
  work.testdir.map((testdir)=> {
    shelljs.rm('-rf', testdir)
  })
})

test('lunch up', async t => {
  const app = t.context.app;
  await app.client.waitUntilWindowLoaded();

  const win = app.browserWindow;
  t.is(await app.client.getWindowCount(), 1);
  t.false(await win.isMinimized());
  t.false(await win.isDevToolsOpened());
  t.true(await win.isVisible());
  t.true(await win.isFocused());

  const {width, height} = await win.getBounds();
  t.true(width > 0);
  t.true(height > 0);
});

// test('test-window-', async t => {
// })

test('test-window-home', async t => {
  const client = t.context.app.client;

  const title = await client.getTitle()
  t.is(title, 'KEI')
  await client.$('#home').click()
  t.is(title, 'KEI')
})

test('test-window-set_tags', async t => {
  const client = t.context.app.client;

  await client.$('#set-tags').click()

  let url = await client.getUrl()
//  console.log(url)

  await client.waitUntilWindowLoaded(1000)
//  await client.waitForExist('#batchmode-pane',1000)

  t.true(await client.isExisting('#batchmode-pane'))

  await client.$('#set-tags').click()

  url = await client.getUrl()
  await client.waitUntilWindowLoaded(1000)

  t.false(await client.isExisting('#batchmode-pane'))
})

test('test-window-settings', async t => {
  const client = t.context.app.client;

  await client.$('#settings').click()

  let url = await client.getUrl()
//  console.log(url)
  await client.waitUntilWindowLoaded()

  t.true(await client.isExisting('#settings-pane'))

  await client.$('#settings').click()

  url = await client.getUrl()
  await client.waitUntilWindowLoaded()

  t.false(await client.isExisting('#settings-pane'))
})

test('test-window-about', async t => {
  const client = t.context.app.client;

  await client.$('#about').click()

  let wincount = client.getWindowCount()
// console.log(await wincount)
  await client.windowByIndex(await wincount - 1)
  const title = client.getTitle()

  t.is(await title, 'About')

})

test('test-window-folder', async t => {
  const client = t.context.app.client;

  const testdir = await prepare();
  copyjpg('jpg', testdir)

  const value = [testdir]
  await fake_dialog.mock([{method: 'showOpenDialog', value: value }])

  await client.$('#folder').click()

//  await client.waitUntilWindowLoaded(1000)

  const err_msg = new RegExp('no such file or directory','g')
  await t.context.app.client.getRenderProcessLogs().then(function (logs) {
    const ret = err_msg.test(JSON.stringify(logs))
// console.log(logs)
    t.false(ret)
  })

//  await client.waitUntilWindowLoaded(1000)

  const footer_status = client.$('#footer-status').getText()
// console.log(await footer_status)
  t.is(await footer_status, 'Status: ' + value)
//  await client.waitForText('sfadsfwerfwfag',10000)

})

test('test-window-file-selected', async t => {
  const client = t.context.app.client;

  const testdir = await prepare();
  copyjpg('jpg', testdir)

  const value = [testdir]
  await fake_dialog.mock([{method: 'showOpenDialog', value: value }])

  await client.$('#folder').click()

  await client.waitUntilWindowLoaded(1000)

  const err_msg = new RegExp('no such file or directory','g')
  await t.context.app.client.getRenderProcessLogs().then(function (logs) {
    const ret = err_msg.test(JSON.stringify(logs))
// console.log(logs)
    t.false(ret)
  })

//  await client.waitUntilWindowLoaded(1000)

  const footer_status = client.$('#footer-status').getText()
// console.log(await footer_status)
  t.is(await footer_status, 'Status: ' + value)
//  await client.waitForText('sfadsfwerfwfag',10000)

//  await client.waitUntilWindowLoaded(1000)
  await client.waitForEnabled('#filelist', 10000)

  await client.$$('#tick-file').$('input').click()
//  await client.$('input').click()
//  await client.$$('#tick-file').$$('input').click()
//  const tick_file = client.$$('#tick-file').$$('input')
//  console.dir(await tick_file)
//  client.click(await tick_file[0])

//  await client.waitUntilWindowLoaded(1000)
  await client.waitForEnabled('.nav-group-item', 10000)
//  await client.waitUntilWindowLoaded(1000)

//  const nav_group_item = client.$('#nav-group-item')
//  let ret = client.$('.nav-group-item').getText()
//  let ret = client.$$('.nav-group-item').$('#selected_file')
  const selected_file = client.$$('.nav-group-item').$('#selected_file').getText()
  const objectname = client.$$('.nav-group-item').$('#ObjectName').getText()
  const keywords = client.$$('.nav-group-item').$('#Keywords').getText()

 console.log(await selected_file, await objectname, await keywords)
})

test('test-window-refresh', async t => {
  const client = t.context.app.client;

  const testdir = await prepare();
  copyjpg('jpg', testdir)

  const value = [testdir]
  await fake_dialog.mock([{method: 'showOpenDialog', value: value }])

  await client.$('#folder').click()

  await client.waitUntilWindowLoaded(1000)

  const err_msg = new RegExp('no such file or directory','g')
  await t.context.app.client.getRenderProcessLogs().then(function (logs) {
    const ret = err_msg.test(JSON.stringify(logs))
// console.log(logs)
    t.false(ret)
  })

  const footer_status = client.$('#footer-status').getText()
  t.is(await footer_status, 'Status: ' + value)
//  await client.waitForText('sfadsfwerfwfag',10000)

  await client.waitForEnabled('#filelist', 10000)

  await client.$$('#tick-file')[0].$('input').click()
//  await client.$('input').click()
//  await client.$$('#tick-file').$$('input').click()
//  const tick_file = client.$$('#tick-file').$$('input')
//  console.dir(await tick_file)
//  client.click(await tick_file[0])

//  await client.waitUntilWindowLoaded(1000)
  await client.waitForEnabled('.nav-group-item', 10000)
//  await client.waitUntilWindowLoaded(1000)

//  const nav_group_item = client.$('#nav-group-item')
//  let ret = client.$('.nav-group-item').getText()
//  let ret = client.$$('.nav-group-item').$('#selected_file')
  const selected_file = client.$$('.nav-group-item').$('#selected_file').getText()
  const objectname = client.$$('.nav-group-item').$('#ObjectName').getText()
  const keywords = client.$$('.nav-group-item').$('#Keywords').getText()

 console.log(await selected_file, await objectname, await keywords)
})

test.only('test-modify-ObjectName', async t => {
  const client = t.context.app.client;
  const idx = 1

  const testdir = await prepare();
  copyjpg('jpg', testdir)

  const value = [testdir]
  await fake_dialog.mock([{method: 'showOpenDialog', value: value }])

  await client.$('#folder').click()

  await client.waitUntilWindowLoaded(1000)

  const err_msg = new RegExp('no such file or directory','g')
  await t.context.app.client.getRenderProcessLogs().then(function (logs) {
    const ret = err_msg.test(JSON.stringify(logs))
// console.log(logs)
    t.false(ret)
  })

//  const footer_status = client.$('#footer-status').getText()
// console.log(await footer_status)
//  t.is(await footer_status, 'Status: ' + value)
//  await client.waitForText('sfadsfwerfwfag',10000)

  await client.waitForEnabled('#filelist', 10000)

  let tick_files = await client.$$('#tick-file').$$('input')
  client.elementIdClick(tick_files[idx].ELEMENT)

  await client.waitForEnabled('.nav-group-item', 10000)

  const before_selected_file = client.$$('.nav-group-item').$('#selected_file').getText()
  const before_objectname = client.$$('.nav-group-item').$('#ObjectName').getText()
  const before_keywords = client.$$('.nav-group-item').$('#Keywords').getText()

  t.is(await before_objectname, 'Empty')
  t.is(await before_keywords, 'Empty')

// console.log(await selected_file, await objectname, await keywords)

  await client.$('#set-tags').click()

  await client.waitForEnabled('#batchmode-pane', 10000)

  const dmy_objectname = 'test_objectname'
  const dmy_keywords   = 'test_keywords'
  await client.$('#title').setValue(dmy_objectname)
  await client.$('#keywords').setValue(dmy_keywords)
  await client.$('#ok').click()

  await client.$('#set-tags').click()
  await client.$('#refresh').click()

  await client.waitForEnabled('#filelist', 10000)

  tick_files = await client.$$('#tick-file').$$('input')
  client.elementIdClick(tick_files[idx].ELEMENT)

  await client.waitForEnabled('.nav-group-item', 10000)

  const after_selected_file = client.$$('.nav-group-item').$('#selected_file').getText()
  const after_objectname = client.$$('.nav-group-item').$('#ObjectName').getText()
  const after_keywords = client.$$('.nav-group-item').$('#Keywords').getText()

  t.is(await before_selected_file, await after_selected_file)
  t.is(await after_objectname, dmy_objectname)
  t.is(await after_keywords, dmy_keywords)
})

test.skip('test-01', async t => {
  let testdir = await prepare()
  t.pass()
})

