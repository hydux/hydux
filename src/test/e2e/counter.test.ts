import * as puppeteer from 'puppeteer'
import * as assert from 'assert'
import * as getPort from 'get-port'
import * as child from 'child_process'
import * as Utils from './utils'

describe('counter test', function () {
  this.timeout(10_000)
  let browser: puppeteer.Browser = null!
  let page: puppeteer.Page = null!
  let port = 0
  let hs: child.ChildProcess = null!
  before(async () => {
    browser = await Utils.launchBrowser()
    port = await getPort()
    hs = await Utils.runServer('counter', port)
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
    await page.waitFor('.count')
    await Utils.counterSuit(page, 0)
    await Utils.counterSuit(page, 1)
  })
})
