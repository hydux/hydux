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
  go = delta => history.go(delta)
  back = () => history.back()
  forward = () => history.forward()
  public _setLoc<P = any, Q extends Query = any>(loc: Location<P, Q>) {
    this.lastLocation = this.location || loc
    this.location = loc
  }
  protected handleChange(path = this.current()) {
    this.listeners.forEach(f => f(path))
  }
}

export type HashHistoryProps = HistoryProps & { hash: string }

export class HashHistory extends BaseHistory {
  props: HashHistoryProps
  constructor(props: Partial<HashHistoryProps> = {}) {
    props = {
      hash: '#!',
      ...props,
    }
    super(props)
    this.props = {
      ...this.props,
      ...props,
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
