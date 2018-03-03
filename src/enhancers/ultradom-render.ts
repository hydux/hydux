import { patch, createNode as _h, Component, VNode } from 'ultradom'
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
const __HYDUX_RENDER_NODE__ = '__HYDUX_RENDER_NODE__'
export default function withUltradom<State, Actions>(container: Element = document.body, options: {
  raf?: boolean
} = { raf: true }): (app: App<State, Actions>) => App<State, Actions> {
  let rafId
  return app => props => app({
    ...props,
    onRender(view) {
      props.onRender && props.onRender(view)
      // fix duplicate node in hmr
      const render = () => {
        let rootEl = container[__HYDUX_RENDER_NODE__]
        if (!rootEl) {
          rootEl = container[__HYDUX_RENDER_NODE__] = patch(view)
          container.appendChild(rootEl)
        } else {
          container[__HYDUX_RENDER_NODE__] = patch(view, rootEl)
        }
      }

      if (!options.raf) {
        return render()
      }
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      rafId = window.requestAnimationFrame(render)
    }
  })
}
