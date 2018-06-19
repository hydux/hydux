import { AppProps, App, normalize } from './../index'
import { get } from '../utils'
function defaultLogger (level: Required<Options>['level'], prevState, action, nextState, extra) {
  (console.group as any)('%c action', 'color: gray; font-weight: lighter;', action.name)
  console[level]('%c prev state', 'color: #9E9E9E; font-weight: bold;', prevState)
  console[level]('%c data', 'color: #03A9F4; font-weight: bold;', ...action.data, ...extra)
  console[level]('%c next state', 'color: #4CAF50; font-weight: bold;', nextState)
  console.groupEnd()
}

export type Options<State = any> = {
  logger?: (level: Required<Options>['level'], prevState: State, action: { name: string, data: any }, nextState: State, extra: any[]) => void
  level?: 'debug' | 'info' | 'log' | 'warn' | 'error'
  windowInspectKey?: string
  filter?: (actionPath: string) => boolean
  logActionTime?: boolean
  logRenderTime?: boolean
}
export default function withLogger<State, Actions>(options: Options<State> = {}): (app: App<State, Actions>) => App<State, Actions> {
  const {
    logger = defaultLogger,
    windowInspectKey = '__HYDUX_STATE__',
    filter = _ => true,
    logActionTime = true,
    logRenderTime = true,
  } = options
  const scope = typeof window !== 'undefined'
    ? window
    : typeof global !== 'undefined'
      ? global
      : {}
  const timeMap = {}
  const now = () => (scope['performance'] || Date).now()
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => {
    return app({
      ...props,
      init: () => {
        const result = normalize(props.init())
        if (windowInspectKey) {
          scope[windowInspectKey] = {
            prevAppState: void 0,
            nextAppState: result.state,
            action: '@@hydux/INIT',
            msgData: void 0,
          }
        }
        return result
      },
      onUpdateStart: (data) => {
        timeMap[data.action] = now()
      },
      onUpdated: (data) => {
        props.onUpdated && props.onUpdated(data)
        const path = data.action.split('.').slice(0, -1)
        const prevState = get(path, data.prevAppState)
        const nextState = get(path, data.nextAppState)
        if (filter(data.action)) {
          logger(options.level || 'log', prevState, { name: data.action, data: data.msgData }, nextState, logActionTime ? ['time', (now() - timeMap[data.action]) + 'ms'] : [])
        }
        if (windowInspectKey) {
          scope[windowInspectKey] = data
        }
      },
      onRender: view => {
        const start = now()
        const ret = props.onRender && props.onRender(view)
        const end = now()
        if (logRenderTime) {
          console.log('%c render time', 'color: #fa541c; font-weight: bold;', (end - start) + 'ms')
        }
        return ret
      }
    })
  }
}
