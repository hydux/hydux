
import { AppProps, App, Cmd, normalizeInit } from './../index'

let globalState
export default function withHmr<State, Actions>(): (app: App<State, Actions>) => App<State, Actions> {
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => app({
    ...props,
    init() {
      let result = normalizeInit(props.init())
      return [
        globalState || result.state,
        result.cmd,
      ]
    },
    onUpdate(data) {
      props.onUpdate && props.onUpdate(data)
      globalState = data.nextAppState
    },
  })
}
