var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import * as Hydux from '../../../../../src/index';
import { BrowserHistory } from '../../../../../src/enhancers/router';
import * as Counter2 from '../counter2';
// const history = new HashHistory()
export var history = new BrowserHistory();
export var subComps = Hydux.combine({
    counter2: [Counter2, Counter2.init("Counter2")],
    counter3: [Counter2, Counter2.init("Counter3")],
    counter4: [Counter2, Counter2.init("Counter4")],
});
export var actions = __assign({ counter: null, home: null, user: null }, subComps.actions);
var initState = __assign({ counter: null, home: null, user: null }, subComps.state, { page: 'home', 
    // NOTE: `lazyComps` is an auto injected field contains all code-splitting components, you can define the type definitions to used in `view` function.
    lazyComps: {
        counter: undefined,
    } });
export var isSSR = !!global.__INIT_STATE__;
initState = global.__INIT_STATE__ || initState;
export var init = function () {
    return __assign({}, initState);
};
export var routes = {
    path: '/',
    action: function (loc) { return function (state) { return (__assign({}, state, { page: 'home' })); }; },
    children: [{
            path: '/user/:id',
            action: function (loc) { return function (state) { return (__assign({}, state, { page: {
                    page: 'user',
                    id: loc.params.id,
                } })); }; }
        }, {
            path: '/counter',
            getComponent: function () { return ['counter', import('../counter')]; },
            action: function (loc) { return function (state) { return (__assign({}, state, { page: 'counter' })); }; },
        }, {
            path: '/counter2',
            component: Counter2,
            key: 'counter2',
            update: function (loc) { return ({
                page: 'counter2'
            }); },
        }, {
            path: '/counter3',
            component: Counter2,
            key: 'counter3',
            update: function (loc) { return ({
                page: 'counter3'
            }); },
        }, {
            path: '*',
            action: function (loc) { return function (state) { return (__assign({}, state, { page: '404' })); }; },
        }]
};
//# sourceMappingURL=State.js.map