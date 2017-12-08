const assert = require('assert')
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
      render: view => renderResult = view
    })
    assert(ctx.getState().count === 1, 'simple state should work')
    assert.equal(renderResult.count, 1, 'simple state in view should work')

    state = { aa: 1, bb: { cc : 'aa' } }
    ctx = logger<any, any>()(app)({
      init: () => state,
      actions: {},
      view: state => actions => ({ type: 'view', state }),
      render: view => renderResult = view
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
    assert(getState().count === 4, 'up should work')
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
      render: view => renderResult = view
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
        upLater: n => state => actions => [state, Cmd.ofPromise(
          n => new Promise(resolve => setTimeout(() => resolve(n), 10)),
          n,
          actions.up,
        )]
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
      render: view => renderResult = view
    })
    assert(ctx.getState().counter1.count === 1, 'counter1 init should work')

    ctx.actions.counter1.upLater()

    assert(ctx.getState().counter1.count === 1, 'counter1 should work 1')

    await sleep(10)
    assert.equal(ctx.getState().counter1.count, 2, 'counter1 should work 2')

    ctx.actions.counter1.upLater()

    await sleep(10)
    assert(ctx.getState().counter1.count === 3, 'counter1 should work 3')

  })
})
