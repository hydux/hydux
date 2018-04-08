import { AppProps, App, CmdType, Context } from './../index'
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
        let result = props.init()
        if (!(result instanceof Array)) {
          result = [result, Cmd.none]
        }
        initCmd = result[1]
        return [result[0], result[1]]
      },
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
    return ctx
  }
}
