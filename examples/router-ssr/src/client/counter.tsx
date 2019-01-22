import { React } from 'hydux-react'
import * as Hydux from '../../../../src/index'
import * as Utils from './utils'
const Cmd = Hydux.Cmd
const inject = Hydux.inject

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
  setCount(count: number) {
    let ctx = inject<State, Actions>()
    ctx.setState({ count })
  },
  down() {
    let ctx = inject<State, Actions>()
    ctx.setState(({ count: ctx.state.count - 1 }))
  },
  up() {
    let ctx = inject<State, Actions>()
    ctx.setState(({ count: ctx.state.count + 1 }))
  },
  upN(n: number) {
    let ctx = inject<State, Actions>()
    ctx.setState({ count: ctx.state.count + n })
  },
  upLater() {
    let ctx = inject<State, Actions>()
    ctx.addPromise(
      n => {
        return new Promise(resolve =>
          setTimeout(() => resolve(n), 1000))
      },
      10,
      ctx.actions.upN)
  }
}

export const view = (state: State, actions: Actions) => (
  <div>
    <h1>{state.title}: <span className="count">{state.count}</span></h1>
    <button className="down" onClick={actions.down}>–</button>
    <button className="up" onClick={actions.up}>+</button>
    <button className="upLater" onClick={actions.upLater}>+ later</button>
  </div>
)

export type Actions = typeof actions
export type State = ReturnType<typeof init>['state']
