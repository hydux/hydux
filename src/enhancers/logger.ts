import { AppProps, App } from './../index'
import { get } from '../utils'
function defaultLogger (prevState, action, nextState) {
  (console.group as any)('%c action', 'color: gray; font-weight: lighter;', action.name)
  console.log('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState)
  console.log('%c data', 'color: #03A9F4; font-weight: bold;', action.data)
  console.log('%c next state', 'color: #4CAF50; font-weight: bold;', nextState)
  console.groupEnd()
}

export default function withLogger<State, Actions>(options: {
  logger?: (prevState: State, action: { name: string, data: any }, nextState: State) => void,
  windowInspectKey?: string,
  filter?: (actionPath: string) => boolean
} = {}): (app: App<State, Actions>) => App<State, Actions> {
  const {
    logger = defaultLogger,
    windowInspectKey = '__HYDUX_STATE__',
    filter = _ => true,
  } = options
  const scope = typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
      ? global
      : {}
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => {
    return app({
      ...props,
      init: () => {
        const result = props.init()
        let state = result
        if (result instanceof Array) {
          state = result[0]
        }
        if (windowInspectKey) {
          scope[windowInspectKey] = {
            prevAppState: void 0,
            nextAppState: state,
            action: '@@hydux/INIT',
            msgData: void 0,
          }
        }
        return result
      },
      onUpdate: (data) => {
        props.onUpdate && props.onUpdate(data)
        const path = data.action.split('.').slice(0, -1)
        const prevState = get(path, data.prevAppState)
        const nextState = get(path, data.nextAppState)
        if (filter(data.action)) {
          logger(prevState, { name: data.action, data: data.msgData }, nextState)
        }
        if (windowInspectKey) {
          scope[windowInspectKey] = data
        }
      },
    })
  }
}
