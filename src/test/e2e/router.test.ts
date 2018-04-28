import * as puppeteer from 'puppeteer'
import * as assert from 'assert'
import * as getPort from 'get-port'
import * as child from 'child_process'
import * as Utils from './utils'

describe('router test', function () {
  this.timeout(10_000)
  let browser: puppeteer.Browser = null!
  let page: puppeteer.Page = null!
  let port = 0
  let hs: child.ChildProcess = null!
  before(async () => {
    browser = await Utils.launchBrowser()
    port = await getPort()
    hs = await Utils.runServer('router', port)
  })
  after(async () => {
    await browser.close()
    await hs.kill()
  })
  beforeEach(async () => {
    page = await browser.newPage()
    await page.goto(`http://127.0.0.1:${port}`)
  })
  it('simple', async () => {
    await page.waitFor('.main')
    const routeTo = async (sel: string) => {
      await (await page.$(sel))!.click()
      await Utils.sleep(50)
    }
    const $main = (await page.$('.main'))!
    assert.equal(await Utils.text($main), 'Home', `route home`)
    await routeTo('a.users')
    assert.equal(await Utils.text($main), 'User: 1', `route users`)
    await routeTo('a.counter')
    await Utils.counterSuit(page, 0)
    await routeTo('a.e404')
    assert.equal(await Utils.text($main), '404', 'route 404')
  })
})
