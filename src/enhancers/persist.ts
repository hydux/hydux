import { AppProps, App } from '../index'
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
        let result = props.init()
        if (!(result instanceof Array)) {
          result = [result, Cmd.none]
        }
        try {
          const persistState = store.getItem(key)
          if (persistState) {
            result[0] = deserialize(persistState)
          }
        } catch (error) {
          console.error(error)
        }
        return [result[0], result[1]]
      },
      onUpdate: (data) => {
        props.onUpdate && props.onUpdate(data)
        timer && clearTimeout(timer)
        const persist = () => store.setItem(key, serialize(data.nextAppState))
        timer = setTimeout(persist, debounce)
      },
    })
  }

}
