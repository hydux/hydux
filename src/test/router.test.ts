import * as assert from 'assert'
import app, { Cmd } from '../index'
import { parsePath, matchPath } from '../enhancers/router'

describe('router', () => {
  it('parsePath simple', () => {
    let loc = parsePath('/aa/bb?aa=bb&aa=cc&cc=dd')
    assert.deepEqual(loc.params, {}, 'params should be empty obj')
    assert.deepEqual(loc.pathname, '/aa/bb')
    assert.deepEqual(loc.search, '?aa=bb&aa=cc&cc=dd')
    assert.deepEqual(loc.query.aa, ['bb', 'cc'])
    assert.deepEqual(loc.query.cc, 'dd')
    assert.deepEqual(loc.template, null)
  })

  it('parsePath encode', () => {
    let loc = parsePath('/user/%E5%B0%8F%E6%98%8E?aa=vv&aa=%E5%B0%8F%E6%98%8E&aa=badas')
    assert.deepEqual(loc.params, {}, 'params should be empty obj')
    assert.deepEqual(loc.pathname, '/user/小明', 'pathname')
    assert.deepEqual(loc.search, '?aa=vv&aa=%E5%B0%8F%E6%98%8E&aa=badas')
    assert.deepEqual(loc.query.aa, ['vv', '小明', 'badas'])
    assert.deepEqual(loc.template, null)
  })

  it('matchPath simple', () => {
    let [match, params] = matchPath('/aa/bb/cc', '/aa/bb/cc')
    assert.deepEqual(match, true, 'match')
    assert.deepEqual(params, {}, 'params')

    ;[match, params] = matchPath('/aa/bb/cc', '/aa/bb/cc/')
    assert.deepEqual(match, true, 'match')

    ;[match, params] = matchPath('/aa/bb/cc/', '/aa/bb/cc')
    assert.deepEqual(match, true, 'match')

    ;[match, params] = matchPath('/aa/bb/cc/', '/aa/bb/cc/')
    assert.deepEqual(match, true, 'match')

    ;[match, params] = matchPath('/aa/bb/cc', '/aa/bb/cd')
    assert.deepEqual(match, false, 'match')
    assert.deepEqual(params, {}, 'params')

    ;[match, params] = matchPath('/aa/bb/cc', '/aa/ba/cc')
    assert.deepEqual(match, false, 'match')

    ;[match, params] = matchPath('/aa/bb/cc', '/aa/bb')
    assert.deepEqual(match, false, 'match')

    ;[match, params] = matchPath('/aa/bb/', '/aa/bb/cc/')
    assert.deepEqual(match, false, 'match')
  })
})
