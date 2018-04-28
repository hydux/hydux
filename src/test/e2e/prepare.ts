import * as Utils from './utils'
import * as child from 'child_process'
import * as util from 'util'

const pExec = util.promisify(child.exec)

async function main() {
  Promise.all(
    ['counter', 'router', 'code-splitting', 'router-ssr'].map(async app => {
      console.log('Start building...: ', app)
      await pExec('npm run build:dev', {
        cwd: `${process.cwd()}/examples/${app}`
      })
    })
  )
}

main().catch(console.error)
Utils.downloadChrome()
