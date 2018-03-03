import { Location, Query } from './index'

export type HistoryProps = { basePath: string }

export abstract class BaseHistory {
  public location: Location<any, any>
  public lastLocation: Location<any, any>
  protected props: HistoryProps
  protected _last: string[]
  protected listeners: ((path: string) => void)[] = []
  constructor(props: Partial<HistoryProps> = {}) {
    this.props = { basePath: '', ...props }
    this._last = [this.current()]
    this.listeners.push(path => {
      this._last = [this._last[this._last.length - 1], path]
    })
  }
  last = () => this._last[0]
  abstract getRealPath(path: string): string
  abstract current(): string
  abstract push(path: string): void
  abstract replace(path: string): void
  listen = listener => this.listeners.push(listener)
  go(delta) {
    history.go(delta)
  }
  back() {
    history.back()
  }
  forward() {
    history.forward()
  }
  public _setLoc<P = any, Q extends Query = any>(loc: Location<P, Q>) {
    this.lastLocation = this.location || loc
    this.location = loc
  }
  protected handleChange(path = this.current()) {
    this.listeners.forEach(f => f(path))
  }
}

export interface HashHistoryProps extends HistoryProps {
  hash: string
}

export class HashHistory extends BaseHistory {
  protected props: HashHistoryProps
  constructor(props: Partial<HashHistoryProps> = {}) {
    super(props)
    this.props = props = {
      hash: '#!',
      ...this.props,
    }
    window.addEventListener('hashchange', e => {
      this.handleChange()
    })
  }
  getRealPath(path: string) {
    return this.props.hash + this.props.basePath + path
  }
  current() {
    return location.hash.slice(this.props.hash.length + this.props.basePath.length) || '/'
  }
  push(path) {
    location.assign(this.getRealPath(path))
  }
  replace(path) {
    location.replace(this.getRealPath(path))
  }
}

export class BrowserHistory extends BaseHistory {
  constructor(props: Partial<HistoryProps> = {}) {
    super(props)
    window.addEventListener('popstate', e => {
      this.handleChange()
    })
  }
  getRealPath(path: string) {
    return this.props.basePath + path
  }
  current() {
    return location.pathname.slice(this.props.basePath.length)
    + location.search
  }
  push(path) {
    history.pushState(null, '', this.getRealPath(path))
    this.handleChange(path)
  }
  replace(path) {
    history.replaceState(null, '', this.getRealPath(path))
    this.handleChange(path)
  }
}
export interface MemoryHistoryProps extends HistoryProps {
  initPath: string
}
export class MemoryHistory extends BaseHistory {
  protected props: MemoryHistoryProps
  private _stack: string[]
  private _index: number = 0
  constructor(props: Partial<MemoryHistoryProps> = {}) {
    super(props)
    this.props = props = {
      initPath: '/',
      ...this.props,
    }
    this._stack = [this.props.basePath + this.props.initPath]
  }
  getRealPath(path: string) {
    return this.props.basePath + path
  }
  current() {
    return this._stack[this._index].slice(this.props.basePath.length)
  }
  push(path) {
    this._reset()
    this._stack.push(this.props.basePath + path)
    this.handleChange(path)
  }
  replace(path) {
    this._reset()
    this._stack[this._index] = this.props.basePath + path
    this.handleChange(path)
  }
  go(delta) {
    let next = this._index + delta
    next = Math.min(next, this._stack.length - 1)
    next = Math.max(next, 0)
    this._index = next
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
}
