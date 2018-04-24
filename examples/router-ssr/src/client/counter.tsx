import { React } from 'hydux-react'
import { Cmd, noop, ActionsType, ActionType, CmdType } from '../../../../src/index'
import * as Utils from './utils'

const initStateValue = { count: 0 }

export const initState = () => initStateValue
export const initCmd = () => Cmd.ofSub<Actions>(
  _ =>
    Utils.fetch(`/api/initcount`)
    .then(res => res.json())
    .then(data => _.setCount(data.count)),
)
export const init = () => [initState(), initCmd()] as [State, CmdType<Actions>]
export const actions = {
  setCount: count => (state: State) => ({ count }),
  down: () => (state: State) => ({ count: state.count - 1 }),
  up: () => (state: State) => ({ count: state.count + 1 }),
  upN: n => (state: State) => ({ count: state.count + n }),
  upLater: (() => (state: State, actions: Actions) =>
    [ state,
      Cmd.ofPromise(
        n => {
          return new Promise(resolve =>
            setTimeout(() => resolve(n), 1000))
        },
        10,
        actions.upN) ])
}

export const view = (state: State, actions: Actions) => (
  <div>
    <h1>{state.count}</h1>
    <button onClick={actions.down}>–</button>
    <button onClick={actions.up}>+</button>
    <button onClick={actions.upLater}>+ later</button>
  </div>
)

export type Actions = typeof actions
export type State = typeof initStateValue
