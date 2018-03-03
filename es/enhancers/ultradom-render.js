import { patch, createNode as _h } from 'ultradom';
const React = { createElement: h };
export { React };
export function h(type, props, ...children) {
    if (props) {
        for (const key in props) {
            if (key.match(/^on[A-Z]\w+$/)) {
                props[key.toLowerCase()] = props[key];
            }
        }
    }
    return _h(type, props, ...children);
}
const __HYDUX_RENDER_NODE__ = '__HYDUX_RENDER_NODE__';
export default function withUltradom(container = document.body, options = { raf: true }) {
    let rafId;
    return app => props => app(Object.assign({}, props, { onRender(view) {
            props.onRender && props.onRender(view);
            // fix duplicate node in hmr
            const render = () => {
                let rootEl = container[__HYDUX_RENDER_NODE__];
                if (!rootEl) {
                    rootEl = container[__HYDUX_RENDER_NODE__] = patch(view);
                    container.appendChild(rootEl);
                }
                else {
                    container[__HYDUX_RENDER_NODE__] = patch(view, rootEl);
                }
            };
            if (!options.raf) {
                return render();
            }
            if (rafId) {
                window.cancelAnimationFrame(rafId);
            }
            rafId = window.requestAnimationFrame(render);
        } }));
}
//# sourceMappingURL=ultradom-render.js.map