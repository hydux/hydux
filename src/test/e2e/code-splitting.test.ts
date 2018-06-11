import * as puppeteer from 'puppeteer'
import * as assert from 'assert'
import * as getPort from 'get-port'
import * as child from 'child_process'
import * as Utils from './utils'

describe('code-splitting test', function () {
  this.timeout(Utils.timeout)
  let browser: puppeteer.Browser = null!
  let page: puppeteer.Page = null!
  let port = 0
  let hs: child.ChildProcess = null!
  before(async () => {
    browser = await Utils.launchBrowser()
    port = await getPort()
    hs = await Utils.runServer('code-splitting', port)
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
    await page.waitFor('.main')

    const _text = async (e: puppeteer.ElementHandle | string, trim = true) => {
      await Utils.sleep(100)
      if (typeof e === 'string') {
        e = (await page.$$(e))[0]
      }
      return Utils.text(e, trim)
    }
    const routeTo = async (sel: string) => {
      await (await page.$(sel))!.click()
      await Utils.sleep(50)
    }
    assert.equal(await _text('.main'), 'Home', `route home`)
    await routeTo('a.users')
    assert.equal(await _text('.main'), 'User: 1', `route users`)
    await routeTo('a.counter')
    await Utils.counterSuit(page, 0)
    await routeTo('a.e404')
    assert.equal(await _text('.main'), '404', 'route 404')
    await page.goto(`http://127.0.0.1:${port}`)
    // page.on('console', e => {
    //   console.log(e.text())
    // })
    // let loading = await page.evaluateHandle(
    //   () => {
    //     const a = document.querySelector('a.counter')! as HTMLLinkElement
    //     a.click()
    //     return new Promise(res => {
    //       const loop = () => {
    //         const text = (document.querySelector('.main')! as HTMLElement).innerText
    //         console.log('text', text)
    //         if (text.includes('Loading...')) {
    //           clearInterval(t)
    //           res(text)
    //         }
    //       }
    //       loop()
    //       let t = setInterval(loop, 1)
    //     })
    //   }
    // )
    // loading = await loading.jsonValue()
    // assert.equal(loading, 'Loading...', 'loading')
  })
})
