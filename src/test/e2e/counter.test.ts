import * as puppeteer from 'puppeteer'
import * as assert from 'assert'
import * as getPort from 'get-port'
import * as child from 'child_process'
import * as Utils from './utils'

describe('counter test', function () {
  this.timeout(Utils.timeout)
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
    console.log('start close browser')
    await browser.close()
    await hs.kill()
    console.log('end close browser')
  })
  beforeEach(async () => {
    page = await browser.newPage()
    await page.goto(`http://127.0.0.1:${port}`)
  })
  afterEach(async () => {
    await page.close()
    console.log('page closed')
  })
  it('simple', async () => {
    await page.waitFor('.count')
    await Utils.counterSuit(page, 0)
    await Utils.counterSuit(page, 1)
    await Utils.counterSuit(page, 2)
    await Utils.counterSuit(page, 3)
  })
})
