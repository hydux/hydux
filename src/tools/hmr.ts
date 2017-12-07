
import { AppProps, App } from './../index'

let globalState
let ctx
export default function withHmr<State, Actions>(options): (app: App<State, Actions>) => App<State, Actions> {
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => {
    console.log('execute')
    ctx = app({
      ...props,
      init() {
        let result = props.init()
        if (!(result instanceof Array)) {
          result = [result, []]
        }
        console.log('init', globalState)
        return [globalState || result[0], result[1]]
      },
      render(state) {
        (window as any).state = globalState = state
        return props.render && props.render(state)
      }
    })
    return ctx
  }
}
