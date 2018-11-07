import { h, React } from '../../../src/enhancers/picodom-render'
// import { Cmd, noop, ActionsType, ActionType } from '../../../src/index'
import * as Hydux from '../../../src/index'
import * as Counter from './counter'
import { dispatcher } from '../../../src/dispatcher'
const { Cmd, inject } = Hydux

export const init = () => {
  return {
    state: {
      count: 0,
      counter: Counter.init().state
    },
    cmd: Cmd.map(
      (_: Actions) => _.counter,
      Counter.init().cmd,
    )
  }
}
export const actions = {
  counter: Counter.actions,
  up() {
    let { state, actions, setState, Cmd } = inject<State, Actions>()
    setState({ count: state.count + 1 })
  },
  down() {
    let { state, actions, setState } = inject<State, Actions>()
    setState({ count: state.count - 1 })
  },
  upN(n: number) {
    let { state, actions, setState } = inject<State, Actions>()
    setState({ count: state.count + n })
  },
  upLater() {
    let { state, actions, setState, Cmd } = inject<State, Actions>()
    Cmd.addSub(_ => setTimeout(_.up, 3000))
  }
}

export const view = (state: State, actions: Actions) =>
  <div>
    <h1 class="count">{state.count}</h1>
    <button class="up" onclick={actions.up}>+</button>
    <button class="down" onclick={actions.down}>–</button>
    <button class="upLater" onclick={actions.upLater}>+ later</button>
    <h3>Nest Counter</h3>
    <div>
      {Counter.view(state.counter, actions.counter)}
    </div>
  </div>

export type Actions = typeof actions
export type State = ReturnType<typeof init>['state']
