import { AppProps, App, CmdType, Context, normalize } from './../index'
import Cmd from './../cmd'
import { get } from '../utils'
export type Options = {
  renderToString: (view: any) => string
}
export default function withSSR<State, Actions>(
  options: Options
): (
  app: App<State, Actions>
) => App<State, Actions> {
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => {
    let initCmd: CmdType<Actions> = Cmd.none
    const ctx: Context<State, Actions, Promise<string>> = app({
      ...props,
      init() {
        let result = normalize(props.init())
        initCmd = result.cmd
        result.cmd = Cmd.none
        return result
      },
      onRender() {
        // ignore
        return
      }
    })
    ctx.render = async (state?: State) => {
      await Promise.all(
        initCmd.map(
          sub => sub(ctx.actions)
        )
      )
      state = state || ctx.state
      const view = ctx.view(state, ctx.actions)
      return options.renderToString(view)
    }
    let newCtx = new Proxy(ctx, {
      get(t, p, r) {
        if (p === 'state') {
          const s = t.state
          if ('lazyComps' in s) {
            return { ...s as any, lazyComps: {} }
          }
          return s
        }
        return t[p]
      }
    })
    return newCtx
  }
}
