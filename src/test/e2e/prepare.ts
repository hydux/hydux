import * as Utils from './utils'
import * as child from 'child_process'
import * as util from 'util'

const pExec = util.promisify(child.exec)

async function main() {
  Promise.all(
    ['counter', 'router', 'code-splitting', 'router-ssr'].map(async app => {
      const execOpts: child.ExecOptions = {
        cwd: `${process.cwd()}/examples/${app}`,
      }
      console.log('Start building...: ', app)
      // Fix concurrent issue for node-sass
      let p = await pExec('yarn --mutex=network', execOpts)
      console.log(p.stdout)
      console.error(p.stderr)
      p = await pExec('yarn build:dev', execOpts)
      console.log(p.stdout)
      console.error(p.stderr)
    })
  )
}

main().catch(console.error)
Utils.downloadChrome()
