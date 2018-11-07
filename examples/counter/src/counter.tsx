import { h, React } from '../../../src/enhancers/picodom-render'
// import { Cmd, noop, ActionsType, ActionType } from '../../../src/index'
import * as Hydux from '../../../src/index'
const { Cmd } = Hydux

export const init = () => {
  return {
    state: {
      count: 0
    },
    cmd: Cmd.none
  }
}
export const actions = {
  up: (): any => (state: State, actions: Actions): Hydux.AR<State, Actions> => {
    return [{ count: state.count + 1 }, Cmd.none]
  },
  down: (): any => state => ({ count: state.count - 1 }),
  upN: (n): any => (state: State) => ({ count: state.count + n }),
  upLater: (): any => (state) => (actions) => ({
    state,
    cmd: Cmd.ofPromise(
      n => {
        return new Promise(resolve =>
          setTimeout(() => resolve(n), 1000))
      },
      10,
      actions.upN)
  })
}

export const view = (state: State, actions: Actions) =>
  <div>
    <h1 class="count">{state.count}</h1>
    <button class="up" onclick={actions.up}>+</button>
    <button class="down" onclick={actions.down}>–</button>
    <button class="upLater" onclick={actions.upLater}>+ later</button>
  </div>

export type Actions = typeof actions
export type State = ReturnType<typeof init>['state']
