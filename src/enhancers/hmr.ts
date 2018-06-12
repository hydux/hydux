
import { AppProps, App, Cmd, normalizeInit } from './../index'

let globalState
export default function withHmr<State, Actions>(): (app: App<State, Actions>) => App<State, Actions> {
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => app({
    ...props,
    init() {
      let result = normalizeInit(props.init())
      result.state = globalState || result.state
      return result
    },
    onUpdate(data) {
      props.onUpdate && props.onUpdate(data)
      globalState = data.nextAppState
    },
  })
}
