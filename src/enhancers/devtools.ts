import { connectViaExtension, extractState } from 'remotedev'
import Cmd from '../cmd'
import { merge, setDeep } from '../utils'
import { AppProps, App } from './../index'
export type Options<State> = {
  remote?: boolean,
  hostname?: string,
  port?: number,
  secure?: boolean,
  getActionType?: (a: object) => any,
  /// debounce ms
  debounce?: number,
  /// filter action name
  filter?: (action: string) => true,
  jsonToState?: (j: object) => State,
  stateToJson?: (s: State) => object,
}

export default function withDevtools<State, Actions>(_options: Options<State>): (app: App<State, Actions>) => App<State, Actions> {
  const options: Required<Options<State>> = {
    remote: false,
    hostname: 'remotedev.io',
    port: 443,
    secure: true,
    getActionType: f => f,
    debounce: 10,
    filter: _ => true,
    jsonToState: f => f as any,
    stateToJson: f => f as any,
    ..._options
  }
  const { jsonToState, stateToJson } = options
  const connection = connectViaExtension(options)
  let timer
  return (app: App<State, Actions>) => (props: AppProps<State, Actions>) => {
    const ctx = app({
      ...props,
      init: () => {
        const result = props.init()
        const state = (result instanceof Array) ? result[0] : result
        connection.init(stateToJson(state))
        return result
      },
      onUpdate: (data) => {
        props.onUpdate && props.onUpdate(data)
        if (!options.filter(data.action)) {
          return
        }
        const send = () => connection.send({
          type: 'update',
          msg: { data: data.msgData, type: data.action },
        }, stateToJson(data.nextAppState))
        timer && clearTimeout(timer)
        timer = setTimeout(send, options.debounce)
      },
      subscribe: (model) => {
        function sub(actions) {
          connection.subscribe(function(msg) {
            if (msg.type === 'DISPATCH') {
              switch (msg.payload.type) {
                case 'JUMP_TO_ACTION':
                case 'JUMP_TO_STATE':
                  ctx.render(jsonToState(extractState(msg)))
                  break
                case 'IMPORT_STATE':
                  const states = msg.payload.nextLiftedState.computedStates
                  const state = states[states.length - 1]
                  ctx.render(jsonToState(state.state))
                  connection.send(null, msg.payload.nextLiftedState)
              }
            }
          })
        }
        return props.subscribe
          ? Cmd.batch([sub], props.subscribe(model))
          : [sub]
      },
      // onError: err => {
      //   props.onError && props.onError(err)
      //   connection.error(err.message)
      // }
    })
    return ctx
  }
}
