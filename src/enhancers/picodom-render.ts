import { patch, h as _h, Component, VNode } from 'picodom'
import { App } from '../index'

const React = { createElement: h }

export { React }

export function h<Props>(
  type: Component<Props> | string,
  props?: Props,
  ...children: Array<VNode<{}> | string | number | null>
): VNode<Props> {
  if (props) {
    for (const key in props) {
      if (key.match(/^on[A-Z]\w+$/)) {
        props[key.toLowerCase()] = props[key]
      }
    }
  }
  return _h(type, props, ...children)
}

// fix duplicate node in hmr
let node
export default function withPicodom<State, Actions>(container = document.body): (app: App<State, Actions>) => App<State, Actions> {
  let rafId
  return app => props => app({
    ...props,
    onRender(view) {
      props.onRender && props.onRender(view)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      rafId = window.requestAnimationFrame(
        () => patch(node, (node = view), container)
      )
    }
  })
}
