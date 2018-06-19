import { AppProps, App, normalize } from '../index'
import Cmd from '../cmd'
import { get } from '../utils'
export type Options = {
  store?: Pick<Storage, 'getItem' | 'setItem'>,
  serialize?: (data: any) => string,
  deserialize?: (str: string) => any,
  debounce?: number,
  key?: string,
}
export default function withPersist<State, Actions>(props: Options = {}): (app: App<State, Actions>) => App<State, Actions> {
  const {
    store = localStorage,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    debounce = 50,
    key = 'hydux-persist',
  } = props
  let timer
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => {
    return app({
      ...props,
      init: () => {
        let result = normalize(props.init())
        try {
          const persistState = store.getItem(key)
          if (persistState) {
            result.state = deserialize(persistState)
          }
        } catch (error) {
          console.error(error)
        }
        return result
      },
      onUpdated: (data) => {
        props.onUpdated && props.onUpdated(data)
        timer && clearTimeout(timer)
        const persist = () => store.setItem(key, serialize(data.nextAppState))
        timer = setTimeout(persist, debounce)
      },
    })
  }

}
