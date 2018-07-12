import { React } from 'hydux-react'
import * as Hydux from '../../../../src/index'
import * as Utils from './utils'
const Cmd = Hydux.Cmd

export const init = (title = 'Counter1') => ({
  state: { count: 0, title },
  cmd: Cmd.ofSub(
    (_: Actions) =>
      Utils.fetch(`/api/initcount`)
      .then(res => res.json())
      .then(data => _.setCount(data.count)),
  )
})
export const actions = {
  setCount: (count): any => (state: State) => ({ count }),
  down: (): any => (state: State) => ({ count: state.count - 1 }),
  up: (): any => (state: State) => ({ count: state.count + 1 }),
  upN: (n): any => (state: State): Hydux.AR<State, Actions> => ({ count: state.count + n }),
  upLater: (): any => (state: State, actions: Actions) =>
    [ state,
      Cmd.ofPromise(
        n => {
          return new Promise(resolve =>
            setTimeout(() => resolve(n), 1000))
        },
        10,
        actions.upN) ]
}

export const view = (state: State, actions: Actions) => (
  <div>
    <h1 className="count">{state.title}: {state.count}</h1>
    <button className="down" onClick={actions.down}>–</button>
    <button className="up" onClick={actions.up}>+</button>
    <button className="upLater" onClick={actions.upLater}>+ later</button>
  </div>
)

export type Actions = typeof actions
export type State = ReturnType<typeof init>['state']
