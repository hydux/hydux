import * as assert from 'assert'
import app, { Cmd } from '../index'
import logger from '../enhancers/logger'
function sleep(ns) {
  return new Promise(resolve => setTimeout(resolve, ns))
}
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
    assert(ctx.getState().count === 1, 'simple state should work')
    assert.equal(renderResult.count, 1, 'simple state in view should work')

    state = { aa: 1, bb: { cc : 'aa' } }
    ctx = logger<any, any>()(app)({
      init: () => state,
      actions: {},
      view: (state, actions) => ({ type: 'view', state }),
      onRender: view => renderResult = view
    })
    assert.deepStrictEqual(ctx.getState(), state, 'nested state should work')
    assert.deepStrictEqual(renderResult, { type: 'view', state }, 'nested state in view should work')
  })

  function testCounter(ctx, renderResult, path: string[] = []) {
    function getState() {
      let state = ctx.getState()
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
    console.log('getState().count', getState())
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

  it('nested async actions', async () => {
    const counter = {
      init: () => ({ count: 1 }),
      actions: {
        up: _ => state => ({ count: state.count + 1 }),
        upN: n => state => ({ count: state.count + n }),
        down: _ => state => ({ count: state.count - 1 }),
        reset: _ => ({ count: 1 }),
        up12: _ => (state, actions) => actions.upN(12),
        upLaterByPromise: n => state => actions => new Promise(resolve =>
          setTimeout(() => resolve(actions.upN(n)), 10)),
        upLater: () => state => actions => [state, Cmd.ofPromise(
          () => new Promise(resolve => setTimeout(() => resolve(), 10)),
          void 0,
          actions.up,
        )],
        upLaterWithBatchedCmd: () => state => actions => [state, Cmd.batch([
          Cmd.ofPromise(
            () => new Promise(resolve => setTimeout(() => resolve(), 10)),
            void 0,
            actions.up,
          )
        ])]
      }
    }
    let ctx
    let state
    let renderResult
    ctx = app<any, any>({
      init: () => ({
        counter1: counter.init(),
        counter2: counter.init(),
      }),
      actions: {
        counter1: counter.actions,
        counter2: counter.actions,
      },
      view: state => actions => actions,
      onRender: view => renderResult = view
    })
    assert(ctx.getState().counter1.count === 1, 'counter1 init should work')

    ctx.actions.counter1.upLater()

    assert(ctx.getState().counter1.count === 1, 'counter1 should work 1')

    await sleep(10)
    assert.equal(ctx.getState().counter1.count, 2, 'counter1 should work 2')

    ctx.actions.counter1.upLater()

    await sleep(10)
    assert(ctx.getState().counter1.count === 3, 'counter1 should work 3')

    ctx.actions.counter1.upLaterByPromise(3)
    assert(ctx.getState().counter1.count === 3, 'upLaterByPromise should work 3')
    await sleep(10)
    assert(ctx.getState().counter1.count === 6, 'upLaterByPromise should work 6')

    ctx.actions.counter1.upLaterWithBatchedCmd()
    assert(ctx.getState().counter1.count === 6, 'upLaterWithBatchedCmd should work 6')
    await sleep(10)
    assert(ctx.getState().counter1.count === 7, 'upLaterWithBatchedCmd should work 7')
    ctx.actions.counter1.up12()
    assert(ctx.getState().counter1.count === 19, 'up12 should work 19')
  })
})
