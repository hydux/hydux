import { AppProps, App } from './../index'
import Cmd from './../cmd'
import { get } from '../utils'

export default function withPersist<State, Actions>({
  store = localStorage,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
  debounce = 50,
  key = 'hydux-persist',
} = {}): (app: App<State, Actions>) => App<State, Actions> {
  let timer
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => {
    return app({
      ...props,
      init: () => {
        let result = props.init()
        if (!(result instanceof Array)) {
          result = [result, Cmd.none]
        }
        const persistState = store.getItem(key)
        if (persistState) {
          result[0] = deserialize(persistState)
        }
        return [result[0], result[1]]
      },
      onUpdate: (prevAppState, nextAppState, msg, actionName, path) => {
        props.onUpdate && props.onUpdate(prevAppState, nextAppState, msg, actionName, path)
        timer && clearTimeout(timer)
        const persist = () => store.setItem(key, serialize(nextAppState))
        timer = setTimeout(persist, debounce)
      },
    })
  }

}
