import test from 'ava';
import iptc from 'node-iptc';
import randomatic from 'randomatic';
import shelljs from 'shelljs';
import {Application} from 'spectron';
import fake_dialog from 'spectron-fake-dialog';
import {proxy} from 'proxyrequire'
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

  await client.$('#set_tags').click()

  let url = await client.getUrl()
//  console.log(url)

  await client.waitUntilWindowLoaded(1000)
//  await client.waitForExist('#batchmode-pane',1000)

  t.true(await client.isExisting('#batchmode-pane'))

  await client.$('#set_tags').click()

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

  await client.waitUntilWindowLoaded(1000)

  const err_msg = new RegExp('no such file or directory','g')
  await t.context.app.client.getRenderProcessLogs().then(function (logs) {
    const res = err_msg.test(JSON.stringify(logs))
// console.log(logs)
    t.false(res)
  })

  await client.waitUntilWindowLoaded(1000)

  const footer_status = client.$('#footer-status').getText()
// console.log(await footer_status)
  t.is(await footer_status, 'Status: ' + value)
//  await client.waitForText('sfadsfwerfwfag',10000)

})

test.skip('test-01', async t => {
  let testdir = await prepare()
  t.pass()
})

