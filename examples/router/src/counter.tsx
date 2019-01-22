import { h, React } from '../../../src/enhancers/picodom-render'
import { Cmd, noop, ActionsType, ActionType, inject } from '../../../src/index'
const initState = { count: 0 }
const init = () => initState
const actions = {
  down() {
    let ctx = inject<State, Actions>()
    ctx.setState({ count: ctx.state.count - 1 })
  },
  up() {
    let ctx = inject<State, Actions>()
    ctx.setState({ count: ctx.state.count + 1 })
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
      ctx.actions.upN
    )
  }
}

const view = (state: State, actions: Actions) => (
  <div>
    <h1 class="count">{state.count}</h1>
    <button class="up" onclick={actions.up}>+</button>
    <button class="down" onclick={actions.down}>–</button>
    <button class="upLater" onclick={actions.upLater}>+ later</button>
  </div>
)

export default { init, actions, view }
export type Actions = typeof actions
export type State = typeof initState
