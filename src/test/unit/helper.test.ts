import { noop } from './../../utils'
import * as assert from 'assert'
import * as Hydux from '../../index'

describe('memoize', () => {
  it('memoizeBind', () => {
    function aa(b) {
      return { b }
    }
    let a1 = Hydux.memoizeBind(aa, 1)
    let a11 = Hydux.memoizeBind(aa, 1)
    let a2 = Hydux.memoizeBind(aa, 2)
    assert.notEqual(a1, a2)
    assert.equal(a1, a11)
    assert.equal(a1().b, a11().b)
    assert.equal(a1().b, 1)
    assert.equal(a2().b, 2)
  })

  it('memoizeOne', () => {
    function aa(b) {
      return { b }
    }
    let a1 = Hydux.memoizeOne(aa)
    assert.equal(a1({ a: 1 }), a1({ a: 1 }))
    assert.notEqual(a1({ a: 1 }), a1({ a: 2 }))
    assert.equal(a1({ a: 1 }).b.a, 1)
    assert.equal(a1({ a: 2 }).b.a, 2, '2 == 2')
  })
})
