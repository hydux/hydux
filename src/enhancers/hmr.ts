
import { AppProps, App } from './../index'

let globalState
export default function withHmr<State, Actions>(options): (app: App<State, Actions>) => App<State, Actions> {
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => app({
    ...props,
    init() {
      let result = props.init()
      if (!(result instanceof Array)) {
        result = [result, []]
      }
      return [globalState || result[0], result[1]]
    },
    onUpdate(data) {
      props.onUpdate && props.onUpdate(data)
      globalState = data.nextAppState
    },
  })
}
