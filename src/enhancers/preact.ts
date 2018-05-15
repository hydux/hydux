// import { App } from '../'
// import { h, render as _render } from 'preact'

// const React = { createElement: h }

// export { React, h }

// const __HYDUX_RENDER_ROOT__ = '__HYDUX_RENDER_ROOT__'
// export default function withUltradom<State, Actions>(container: Element = document.body, options: {
//   raf?: boolean
// } = { raf: true }): (app: App<State, Actions>) => App<State, Actions> {
//   let rafId
//   return app => props => app({
//     ...props,
//     view: (s, a) => {
//       if (options.raf) {
//         // Lazy render
//         return () => props.view(s, a)
//       }
//       return props.view(s, a)
//     },
//     onRender(view) {
//       props.onRender && props.onRender(view)
//       // fix duplicate node in hmr
//       const render = () => {
//         if (options.raf) {
//           view = view()
//         }
//         container[__HYDUX_RENDER_ROOT__] = _render(
//           view,
//           container,
//           container[__HYDUX_RENDER_ROOT__],
//         )
//       }

//       if (!options.raf) {
//         return render()
//       }
//       if (rafId) {
//         window.cancelAnimationFrame(rafId)
//       }
//       rafId = window.requestAnimationFrame(render)
//     }
//   })
// }
