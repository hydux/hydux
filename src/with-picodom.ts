import { patch, h } from 'picodom'
import { App } from './index'

const React = { createElement: h }

export { h, React }

export default function withPicodom<State, Actions>(container = document.body): (app: App<State, Actions>) => App<State, Actions> {
  let node
  let rafId
  return app => props => app({
    ...props,
    init() {
      container.innerHTML = ''
      return props.init()
    },
    render(view) {
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      rafId = window.requestAnimationFrame(
        () => patch(node, (node = view), container)
      )
    }
  })
}
