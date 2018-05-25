import { App } from '../'
declare module 'preact'
import { h, render as _render, Component } from 'preact'

const React = { createElement: h }

export { React, h }

export interface Options {
  raf?: boolean,
  debug?: boolean,
}

const __HYDUX_RENDER_ROOT__ = '__HYDUX_RENDER_ROOT__'
let mounted = false
export default function withPreact<State, Actions>(container: Element = document.body, options: Options = {}): (app: App<State, Actions>) => App<State, Actions> {
  let rafId
  options = {
    raf: true,
    ...options
  }

  // fix duplicate node in hmr
  const render = (view: any) => {
    container[__HYDUX_RENDER_ROOT__] = _render(
      view,
      container,
      container[__HYDUX_RENDER_ROOT__],
    )
  }
  const UpdateEvent = '@hydux-preact/update-state'
  if (options.debug) {
    class Root extends Component {
      state = {}
      actions: any
      view: (s: any, a: any) => any = f => null
      componentDidMount() {
        document.addEventListener(UpdateEvent, (e: CustomEvent) => {
          this.view = e.detail[0]
          this.actions = e.detail[2]
          this.setState(e.detail[1])
        })
      }
      render() {
        return this.view(this.state, this.actions)
      }
    }
    if (!mounted) {
      mounted = true
      render(h(Root, null))
    }
  }
  return app => props => app({
    ...props,
    view: (s, a) => {
      if (options.raf || options.debug) {
        return [props.view, s, a]
      }
      return props.view(s, a)
    },
    onRender(view) {
      props.onRender && props.onRender(view)
      if (options!.debug) {
        document.dispatchEvent(new CustomEvent(UpdateEvent, {
          detail: view
        }))
        return
      }
      if (!options.raf) {
        return render(view)
      }
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      rafId = window.requestAnimationFrame(() => {
        render(view[0](view[1], view[2]))
      })
    }
  })
}
