import { noop } from './../../utils'
import * as assert from 'assert'
import app, { Cmd, withParents } from '../../index'
import logger from '../../enhancers/logger'
function sleep(ns) {
  return new Promise(resolve => setTimeout(resolve, ns))
}

const Counter = {
  init: () => ({ count: 1 }),
  actions: {
    up: () => state => ({ count: state.count + 1 }),
    upN: (n: number) => (state: CounterState, actions: CounterActions) => ({ count: state.count + n }),
    down: () => state => ({ count: state.count - 1 }),
    reset: () => ({ count: 1 }),
    up12: () => (state, actions) => actions.upN(12),
    upLaterByPromise: n => state => actions => new Promise(resolve =>
      setTimeout(() => resolve(actions.upN(n)), 10)),
    upLater: () => state => actions => [state, Cmd.ofPromise(
      () => new Promise(resolve => setTimeout(() => resolve(), 10)),
      void 0,
      actions.up,
    )],
    upLaterObj: () => state => actions => ({
      state,
      cmd: Cmd.ofPromise(
        () => new Promise(resolve => setTimeout(() => resolve(), 10)),
        void 0,
        actions.up,
      )
    }),
    upLaterWithBatchedCmd: () => state => actions => [state, Cmd.batch([
      Cmd.ofPromise(
        () => new Promise(resolve => setTimeout(() => resolve(), 10)),
        void 0,
        actions.up,
      )
    ])]
  }
}
let _dummyState = Counter.init()
type CounterState = typeof _dummyState
type CounterActions = typeof Counter.actions

describe('core api', () => {
  it('init', () => {
    let ctx
    let state
    let renderResult
    ctx = app<any, any>({
      init: () => ({ count: 1 }),
      actions: {},
      view: state => actions => state,
      onRender: view => renderResult = view
    })
    assert(ctx.state.count === 1, 'simple state should work')
    assert.equal(renderResult.count, 1, 'simple state in view should work')

    state = { aa: 1, bb: { cc : 'aa' } }
    ctx = logger<any, any>()(app)({
      init: () => state,
      actions: {},
      view: (state, actions) => ({ type: 'view', state }),
      onRender: view => renderResult = view
    })
    assert.deepStrictEqual(ctx.state, state, 'nested state should work')
    assert.deepStrictEqual(renderResult, { type: 'view', state }, 'nested state in view should work')
  })

  function testCounter(ctx, renderResult, path: string[] = []) {
    function getState() {
      let state = ctx.state
      for (const i in path) {
        state = state[path[i]]
      }
      return state
    }
    let actions = ctx.actions
    for (const i in path) {
      actions = actions[path[i]]
    }
    assert(getState().count === 1, 'init should work')
    assert.deepStrictEqual(ctx.actions, renderResult, 'actions in ctx should work')
    actions.up()
    actions.up()
    actions.up()
    console.log('getState().count', getState().count)
    assert.equal(getState().count, 4, 'up should work')
    actions.down()
    actions.down()
    assert(getState().count === 2, 'down should work')
    actions.reset()
    assert(getState().count === 1, 'reset should work')
  }

  it('actions', () => {
    let ctx
    let state
    let renderResult
    ctx = app<any, any>({
      init: () => ({ count: 1 }),
      actions: {
        up: _ => state => ({ count: state.count + 1 }),
        down: _ => state => ({ count: state.count - 1 }),
        reset: _ => ({ count: 1 }),
      },
      view: state => actions => actions,
      onRender: view => renderResult = view
    })
    testCounter(ctx, renderResult)
  })

  it('complex actions', () => {
    let state
    let renderResult
    class ClassActions {
      _inc: number
      constructor(inc) {
        this._inc = inc
      }
      up = () => (state) => {
        return ({ count: state.count + this._inc })
      }
    }
    let ctx = app<any, any>({
      init: () => ({ count: 1, classActions: { count: 1 } }),
      actions: {
        classActions: new ClassActions(10) as any,
        xx: 'aaa' as any, // invalid actions, would be ignored
        _actions: new Date() as any, // invalid actions, would be ignored
        up: _ => state => ({ count: state.count + 1 }),
        down: _ => state => ({ count: state.count - 1 }),
        reset: _ => ({ count: 1 }),
      },
      view: state => actions => actions,
      onRender: view => renderResult = view
    })
    testCounter(ctx, renderResult)
    assert.deepEqual(ctx.state.classActions.count, 1, 'classActions state work')
    ctx.actions.classActions.up()
    assert.deepEqual(ctx.state.classActions.count, 11, 'classActions should work')
  })

  it('nested async actions', async () => {
    let state
    let renderResult
    const _state = {
      counter1: Counter.init(),
      counter2: Counter.init(),
    }
    const actions = {
      counter1: Counter.actions,
      counter2: Counter.actions,
    }
    let ctx = app<typeof _state, typeof actions>({
      init: () => _state,
      actions,
      view: state => actions => actions,
      onRender: view => renderResult = view
    })
    assert(ctx.state.counter1.count === 1, 'counter1 init should work')

    ctx.actions.counter1.upLater()

    assert(ctx.state.counter1.count === 1, 'counter1 should work 1')

    await sleep(10)
    assert.equal(ctx.state.counter1.count, 2, 'counter1 should work 2')

    ctx.actions.counter1.upLater()

    await sleep(10)
    assert(ctx.state.counter1.count === 3, 'counter1 should work 3')

    ctx.actions.counter1.upLaterByPromise(3)
    assert(ctx.state.counter1.count === 3, 'upLaterByPromise should work 3')
    await sleep(10)
    assert(ctx.state.counter1.count === 6, 'upLaterByPromise should work 6')

    ctx.actions.counter1.upLaterWithBatchedCmd()
    assert(ctx.state.counter1.count === 6, 'upLaterWithBatchedCmd should work 6')
    await sleep(10)
    assert(ctx.state.counter1.count === 7, 'upLaterWithBatchedCmd should work 7')
    ctx.actions.counter1.up12()
    assert(ctx.state.counter1.count === 19, 'up12 should work 19')
  })
  it('parent actions', () => {
    const initState = {
      counter1: Counter.init(),
      counter2: Counter.init(),
    }
    // const counter1Actions: CounterActions =
    const actions = {
      counter2: Counter.actions,
      counter1: {
        ...Counter.actions,
        upN: (n: number) => withParents(
          Counter.actions.upN,
          (
            action,
            parentState: State,
            parentActions: Actions,
            _, __
          ) => {
            const [state, cmd] = action(n + 1)
            assert.equal(state.count, parentState.counter1.count + n + 1, 'call child action work')
            return [
              state,
              Cmd.batch(
                cmd,
                Cmd.ofFn(
                  () => parentActions.counter2.up()
                ),
              )
            ]
          }),
      },
    }
    type State = typeof initState
    type Actions = typeof actions
    let ctx = app<typeof initState, typeof actions>({
      init: () => initState,
      actions,
      view: state => actions => actions,
      onRender: noop
    })

    ctx.actions.counter1.upN(1)
    assert.equal(ctx.state.counter1.count, 3, 'counter1 upN work')
    assert.equal(ctx.state.counter2.count, 2, 'counter2 upN work')
  })
})
