
import { AppProps, App, Cmd, normalize } from './../index'

let globalState
export default function withHmr<State, Actions>(): (app: App<State, Actions>) => App<State, Actions> {
  return app => props => app({
    ...props,
    init() {
      let result = normalize(props.init())
      result.state = globalState || result.state
      return result
    },
    onUpdated(data) {
      props.onUpdated && props.onUpdated(data)
      globalState = data.nextAppState
    },
  })
}
