import { AppProps, App } from './../index'
import { get } from '../utils'
function defaultLogger (prevState, action, nextState) {
  (console.group as any)('%c action', 'color: gray; font-weight: lighter;', action.name)
  console.log('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState)
  console.log('%c data', 'color: #03A9F4; font-weight: bold;', action.data)
  console.log('%c next state', 'color: #4CAF50; font-weight: bold;', nextState)
  console.groupEnd()
}

export default function withLogger<State, Actions>({ logger = defaultLogger } = {}): (app: App<State, Actions>) => App<State, Actions> {
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => {
    return app({
      ...props,
      onUpdate: (prevAppState, nextAppState, msg, actionName, path) => {
        if (props.onUpdate) {
          props.onUpdate(prevAppState, nextAppState, msg, actionName, path)
        }
        const prevState = get(path, prevAppState)
        const nextState = get(path, nextAppState)
        logger(prevAppState, { name: path.concat(actionName).join('.'), data: msg }, nextState)
      },
    })
  }
}
