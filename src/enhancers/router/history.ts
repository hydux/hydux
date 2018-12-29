import { Location, Query, Param, RoutesMeta, Routes } from './index'
import { debug } from '../../utils'

export type HistoryProps = { basePath: string, initPath: string }

const isBrowser =
  typeof window !== 'undefined'
  && typeof location !== 'undefined'
  && typeof history !== 'undefined'

export function parsePath<P extends Param, Q extends Query>(path: string, tpls: string[]): Location<P, Q> {
  const splits = path.split('?')
  const pathname = decodeURI(splits[0])
  const search = splits[1] ? '?' + splits[1] : ''
  const query = search.slice(1).split('&').filter(Boolean)
    .reduce((query, kv) => {
      const [key, value] = kv.split('=').map(decodeURIComponent)
      if (query[key]) {
        query[key] = Array.prototype.concat.call([], query[key], value)
      } else {
        query[key] = value || ''
      }
      return query
    }, {}) as Q
  let template = null as null | string
  let params = {} as P
  for (const tpl of tpls) {
    const p = matchPath<P>(pathname, tpl)
    if (p) {
      params = p
      template = tpl
      break
    }
  }
  return {
    pathname,
    params,
    query,
    search,
    template,
  }
}

export function matchPath<P>(pathname: string, fmt: string): P | null {
  let paramKeys: string[] = []
  let re = '^' + fmt.replace(/\/$/, '').replace(/([.%|(){}\[\]])/g, '\\$1').replace(/\*/g, '.*').replace(/\/\:([\w]+)/g, (m, name) => {
    paramKeys.push(name)
    return '/([^/]+)'
  }) + '\/?$'
  let match = pathname.match(new RegExp(re))
  if (match) {
    const params = paramKeys.reduce(
      (params, key, i) =>
        ({ ...params, [key]: match && match[i + 1] }),
      {}) as P
    return params
  }
  return null
}

export abstract class BaseHistory {
  public location: Location<any, any>
  public lastLocation: Location<any, any>
  /* @internal */
  public _routesMeta: RoutesMeta<any, any>
  protected _props: HistoryProps
  protected _last: string[] = []
  protected _listeners: ((path: string) => void)[] = []
  protected _fireInitPath = true
  private _routes: Routes<any, any> = {}
  private _routesTpls: string[] = []
  constructor(props: Partial<HistoryProps> = {}) {
    this._props = props = { basePath: '', initPath: '/', ...props }
    this._listeners.push(path => {
      this._last = this._last.concat(path).slice(-2)
      this._updateLocation(path)
    })
    if (this._fireInitPath) {
      this._fireChange(this._props.initPath)
    }
  }
  abstract realPath(path: string): string
  abstract get current(): string
  abstract get length(): number
  abstract push(path: string): void
  abstract replace(path: string): void
  get last() {
    return this._last[0] || this._props.initPath
  }
  listen(listener: ((path: string) => void)) {
    this._listeners.push(listener)
  }
  unlisten(listener: ((path: string) => void)) {
    this._listeners = this._listeners.filter(l => l !== listener)
  }
  go(delta: number) {
    history.go(delta)
  }
  back() {
    history.back()
  }
  forward() {
    history.forward()
  }
  parsePath(path: string): Location<any, any> {
    return parsePath(path, this._routesTpls)
  }
  /**
   * Dispose a history instance, its useful in HMR
   */
  dispose() {
    this._listeners = []
  }
  /* @internal */
  public _setRoutes(routes: Routes<any, any>, routesMeta: RoutesMeta<any, any>) {
    this._routesMeta = routesMeta
    this._routes = routes
    this._routesTpls = Object.keys(routes || {})
    this._updateLocation()
  }
  protected _fireChange(path = this.current) {
    this._listeners.forEach(f => f(path))
  }
  protected _updateLocation(path: string = this.current) {
    const loc = this.parsePath(path)
    this.lastLocation = this.location || loc
    this.location = loc
  }
}

export interface HashHistoryProps extends HistoryProps {
  hash: string
}

export class HashHistory extends BaseHistory {
  protected _props: HashHistoryProps
  constructor(props: Partial<HashHistoryProps> = {}) {
    super(props)
    if (!isBrowser) {
      return new MemoryHistory() as any
    }
    super(props)
    this._props = props = {
      hash: '#!',
      ...this._props,
    }
    this._last = [this.current]
    window.addEventListener('hashchange', this._handleHashChange)
  }
  realPath(path: string) {
    return this._props.hash + this._props.basePath + path
  }
  get length() {
    return history.length
  }
  get current() {
    return location.hash.slice(this._props.hash.length + this._props.basePath.length) || '/'
  }
  push(path: string) {
    location.assign(this.realPath(path))
  }
  replace(path: string) {
    location.replace(this.realPath(path))
  }

  dispose() {
    super.dispose()
    window.removeEventListener('hashchange', this._handleHashChange)
  }

  private _handleHashChange = () => {
    this._fireChange()
  }
}

export class BrowserHistory extends BaseHistory {
  constructor(props: Partial<HistoryProps> = {}) {
    super(props)
    if (!isBrowser) {
      return new MemoryHistory(props) as any
    }
    super(props)
    this._last = [this.current]
    window.addEventListener('popstate', this._handlePopState)
  }
  realPath(path: string) {
    return this._props.basePath + path
  }
  get length() {
    return history.length
  }
  get current() {
    return location.pathname.slice(this._props.basePath.length)
    + location.search
  }
  push(path: string) {
    history.pushState(null, '', this.realPath(path))
    this._fireChange(path)
  }
  replace(path: string) {
    history.replaceState(null, '', this.realPath(path))
    this._fireChange(path)
  }
  dispose() {
    super.dispose()
    window.removeEventListener('popstate', this._handlePopState)
  }

  private _handlePopState = () => {
    this._fireChange()
  }
}
export interface MemoryHistoryProps extends HistoryProps {
  initPath: string
  store?: boolean | Storage
}
export class MemoryHistory extends BaseHistory {
  protected _props: MemoryHistoryProps
  protected _fireInitPath: false
  private _stack: string[] = []
  private _storeKey: string = '@hydux-router/memoryhistory'
  private _index: number = 0
  constructor(props: Partial<MemoryHistoryProps> = {}) {
    super(props)
    this._props = props = {
      ...this._props,
    }
    // Override initialization in super class
    this._stack = [this._props.basePath + this._props.initPath]
    const storage = this._getStorage()
    if (storage) {
      this.listen(path => {
        storage!.setItem(this._storeKey, JSON.stringify(this._stack))
      })
      const stack = storage.getItem(this._storeKey)
      if (stack) {
        this._stack = JSON.parse(stack)
        return
      }
    }
    this._fireChange(this._props.initPath)
  }
  realPath(path: string) {
    return this._props.basePath + path
  }
  get length() {
    return this._stack.length
  }
  get current() {
    return this._stack[this._index].slice(this._props.basePath.length)
  }
  push(path: string) {
    this._reset()
    this._stack.push(this._props.basePath + path)
    this._index++
    this._fireChange(path)
  }
  replace(path: string) {
    this._reset()
    this._stack[this._index] = this._props.basePath + path
    this._fireChange(path)
  }
  go(delta: number) {
    let next = this._index + delta
    next = Math.min(next, this._stack.length - 1)
    next = Math.max(next, 0)
    this._index = next
    this._updateLocation()
    this._fireChange()
  }
  back() {
    this.go(-1)
  }
  forward() {
    this.go(1)
  }
  private _reset() {
    this._stack = this._stack.slice(0, this._index + 1)
  }

  private _getStorage() {
    return (this._props.store && typeof this._props.store === 'boolean')
    ? localStorage
    : this._props.store || null
  }
}
