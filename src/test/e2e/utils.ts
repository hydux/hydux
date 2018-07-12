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

  async function click(text: string) {
    return (await page.$$(text))[n].click()
  }

  await page.waitFor('.count')
  await sleep(800)
  console.log('text 1')
  assert.equal(await _text('.count'), `${init}`, `count${n}`)
  await click('.up')
  console.log('text 2')
  assert.equal(await _text('.count'), `${init + 1}`, `count${n} up`)
  await click('.down')
  assert.equal(await _text('.count'), `${init}`, `count${n} down`)
  await click('.upLater')
  assert.equal(await _text('.count'), `${init}`, `count${n} upLater before`)
  await sleep(1100)
  assert.equal(await _text('.count'), `${init + 10}`, `count${n} upLater`)
  await click('.up')
  await click('.up')
  await click('.up')
  assert.equal(await _text('.count'), `${init + 13}`, `count${n} upLater`)
}
