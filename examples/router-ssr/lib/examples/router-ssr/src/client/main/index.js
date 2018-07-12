import * as Hydux from '../../../../../src/index';
import withReact from 'hydux-react';
import * as ReactDOM from 'react-dom/server';
import withSSR from '../../../../../src/enhancers/ssr';
import withRouter, { MemoryHistory } from '../../../../../src/enhancers/router';
import '../polyfill.ts';
import * as State from './State';
import * as View from './View';
// const history = new HashHistory()
export function main(path) {
    var noop = function (f) { return f; };
    // NOTE: The order matters !!! If you are trying to integrate code splitting & SSR, you should ensure the enhancers order as ?withSSR -> withRouter -> ?withReact.
    var withEnhancers = Hydux.compose(__is_browser
        ? noop
        // Inject `renderToString` to Hydux on the server side, so we can call `ctx.render` to run all init commands and render the vdom to html string.
        : withSSR({
            renderToString: function (view) {
                return ReactDOM.renderToString(view);
            },
        }), withRouter({
        history: __is_browser
            ? State.history
            // Since there are no history API on the server side, we should use MemoryHistory here.
            : new MemoryHistory({ initPath: path }),
        routes: State.routes,
        ssr: State.isSSR,
        isServer: !__is_browser,
    }), __is_browser
        ? withReact(document.getElementById('root'), { hydrate: true }) // temporary fix for hydux-react
        : noop);
    var app = withEnhancers(Hydux.app);
    if (process.env.NODE_ENV === 'development' && __is_browser) {
        var devTools = require('hydux/lib/enhancers/devtools').default;
        var logger = require('hydux/lib/enhancers/logger').default;
        var hmr = require('hydux/lib/enhancers/hmr').default;
        app = logger()(app);
        app = devTools()(app);
        app = hmr()(app);
    }
    // WithSSR would assume the app is running on the server side, so it won't render anything to the DOM, but will call renderToString when you call ctx.render()
    var ctx = app({
        init: State.init,
        actions: State.actions,
        view: View.root,
    });
    if (__dev) {
        window.ctx = ctx;
    }
    return ctx;
}
if (__is_browser) {
    main();
}
//# sourceMappingURL=index.js.map