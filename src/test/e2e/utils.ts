import * as puppeteer from 'puppeteer'
import * as child from 'child_process'
import * as assert from 'assert'

export const IsCI = !!process.env.CI
export const Examples = `${process.cwd()}/examples`
export const timeout = 60_000 * 10
export const runServer = async (app: string, port: number) => {
  const p = child.exec(`${process.cwd()}/node_modules/.bin/serve -n -c 0 -s -p ${port}`, {
    cwd: `${Examples}/${app}`,
  })
  p.stderr.on('data', console.error)
  await new Promise(
    res => p.stdout.on(
      'data',
      d => (console.log(d), res())
    )
  )
  await sleep(1000)
  return p
}

export async function downloadChrome() {
  if (!IsCI && require('get-chrome')()) {
    console.log('Chrome is installed')
    return
  }
  const revision = require(`${process.cwd()}/node_modules/puppeteer/package.json`)
  .puppeteer
  .chromium_revision
  console.log('Start downloading chrome:', revision)
  const p = puppeteer as any
  const fetcher = p.createBrowserFetcher()
  const revisionInfo = await fetcher.download(revision)
  console.log('Chrome downloaded info:', revisionInfo)
}

export const sleep = (ms: number) =>
  new Promise(res => setTimeout(res, ms))

export const launchBrowser = async () => {
  return puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: IsCI
      ? puppeteer.executablePath()
      : require('get-chrome')()
  })
}

export const text = async (e: puppeteer.ElementHandle, trim = true) => {
  await sleep(100)
  return e.getProperty('innerText')
    .then(e => e.jsonValue())
    .then(e => trim ? e.trim() : e)
}
export const counterSuit = async (page: puppeteer.Page, n = 0, init = 0) => {
  const _text = async (e: puppeteer.ElementHandle | string, trim = true) => {
    await sleep(100)
    if (typeof e === 'string') {
      e = (await page.$$(e))[n]
    }
    return text(e, trim)
  }

  await page.waitFor('.count')
  const c1 = (await page.$$('.count'))[n]
  const c1Up = (await page.$$('.up'))[n]
  const c1Down = (await page.$$('.down'))[n]
  const c1UpLater = (await page.$$('.upLater'))[n]
  console.log('text 1')
  assert.equal(await _text('.count'), `${init}`, `count${n}`)
  await c1Up.click()
  console.log('text 2')
  assert.equal(await _text(c1), `${init + 1}`, `count${n} up`)
  await c1Down.click()
  assert.equal(await _text(c1), `${init}`, `count${n} down`)
  await c1UpLater.click()
  assert.equal(await _text(c1), `${init}`, `count${n} upLater before`)
  await sleep(1100)
  assert.equal(await _text(c1), `${init + 10}`, `count${n} upLater`)
  await c1Up.click()
  await c1Up.click()
  await c1Up.click()
  assert.equal(await _text(c1), `${init + 13}`, `count${n} upLater`)
}
