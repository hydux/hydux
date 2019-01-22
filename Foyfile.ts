import { task, fs, option, setOption } from 'foy'
import * as pathLib from 'path'

task('build', async ctx => {
  await ctx.fs.rmrf('./lib')
  await ctx.exec(`tsc -d`)
  let cwd = process.cwd()
  await ctx.fs.iter(`./src`, async (file, stat) => {
    if (file.endsWith('.js.flow')) {
      await ctx.fs.copy(
        file,
        pathLib
          .relative(cwd, file)
          .replace('src', 'lib'),
      )
    }
  })
})

task('build:es', async ctx => {
  await ctx.fs.rmrf(`es`)
  await ctx.exec(`tsc -d -m es6 --outDir ./es`)
})

task('build:dist', async (ctx) => {
  await ctx.exec(`webpack -p --progress --profile`)
})

const MochaCli = `mocha --exit -r tsconfig-paths/register -r ts-node/register`

task('test:e2e', async ctx => {
  await ctx.exec(`ts-node ./src/test/e2e/prepare.ts && ${MochaCli} \"src/test/**/*.test.ts\"`)
})

task('test:watch', async (ctx) => {
  await ctx.exec(`${MochaCli} -w --watch-extensions ts,tsx`)
})

task('doc', async ctx => {
  await ctx.exec([
    `typedoc --theme default --mode file --exclude \"**/test/**/*.ts\"  --excludeNotExported --excludePrivate --out ./docs/api ./src`
  ])
})

task('flow', async ctx => {
  await ctx.exec(`flow check`)
})

setOption({ loading: false })
task<{ version: string }>(
  'preversion', [
    // { name: 'flow', async: true },
    { name: 'test', async: true },
    { name: 'build:all', async: true },
  ],
  async ctx => {
    console.log('ctx.options', ctx.options)
    await ctx.exec([
      `changelog --${ctx.options.version} -x chore`,
      `git add -A`,
      `git commit -m 'updated CHANGELOG.md'`,
    ])
  }
)

task(
  'build:all', [
    { name: 'build', async: true },
    { name: 'build:dist', async: true },
    { name: 'build:es', async: true },
  ],
)

option('-t, --type <ver>', 'Semver versions, patch | major | minor')
task<{ type: 'patch' | 'major' | 'minor' }>('publish', async ctx => {
  await ctx.run('preversion', { options: { version: ctx.options.type } })
  await ctx.exec(`npm version ${ctx.options.type}`)
  await Promise.all([
    ctx.exec(`git push origin master --tags`),
    ctx.exec(`npm --registry https://registry.npmjs.org/ publish`),
  ])
})

task('test', async ctx => {
  await ctx.exec(`${MochaCli} \"src/test/unit/*.test.ts\"`)
})

task('test:all', ['test'.async(), 'test:e2e'.async()])
