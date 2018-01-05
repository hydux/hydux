"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./../utils");
var assert = require("assert");
var router_1 = require("../enhancers/router");
describe('router', function () {
    it('parsePath simple', function () {
        var loc = router_1.parsePath('/aa/bb?aa=bb&aa=cc&cc=dd');
        assert.deepEqual(loc.params, {}, 'params should be empty obj');
        assert.deepEqual(loc.pathname, '/aa/bb');
        assert.deepEqual(loc.search, '?aa=bb&aa=cc&cc=dd');
        assert.deepEqual(loc.query.aa, ['bb', 'cc']);
        assert.deepEqual(loc.query.cc, 'dd');
        assert.deepEqual(loc.template, null);
    });
    it('parsePath encode', function () {
        var loc = router_1.parsePath('/user/%E5%B0%8F%E6%98%8E?aa=vv&aa=%E5%B0%8F%E6%98%8E&aa=badas');
        assert.deepEqual(loc.params, {}, 'params should be empty obj');
        assert.deepEqual(loc.pathname, '/user/小明', 'pathname');
        assert.deepEqual(loc.search, '?aa=vv&aa=%E5%B0%8F%E6%98%8E&aa=badas');
        assert.deepEqual(loc.query.aa, ['vv', '小明', 'badas']);
        assert.deepEqual(loc.template, null);
    });
    it('matchPath simple', function () {
        var _a = router_1.matchPath('/aa/bb/cc', '/aa/bb/cc'), match = _a[0], params = _a[1];
        assert.deepEqual(match, true, 'match');
        assert.deepEqual(params, {}, 'params');
        _b = router_1.matchPath('/aa/bb/cc', '/aa/bb/cc/'), match = _b[0], params = _b[1];
        assert.deepEqual(match, true, 'match');
        _c = router_1.matchPath('/aa/bb/cc/', '/aa/bb/cc'), match = _c[0], params = _c[1];
        assert.deepEqual(match, true, 'match');
        _d = router_1.matchPath('/aa/bb/cc/', '/aa/bb/cc/'), match = _d[0], params = _d[1];
        assert.deepEqual(match, true, 'match');
        _e = router_1.matchPath('/aa/bb/cc', '/aa/bb/cd'), match = _e[0], params = _e[1];
        assert.deepEqual(match, false, 'match');
        assert.deepEqual(params, {}, 'params');
        _f = router_1.matchPath('/aa/bb/cc', '/aa/ba/cc'), match = _f[0], params = _f[1];
        assert.deepEqual(match, false, 'match');
        _g = router_1.matchPath('/aa/bb/cc', '/aa/bb'), match = _g[0], params = _g[1];
        assert.deepEqual(match, false, 'match');
        _h = router_1.matchPath('/aa/bb/', '/aa/bb/cc/'), match = _h[0], params = _h[1];
        assert.deepEqual(match, false, 'match');
        var _b, _c, _d, _e, _f, _g, _h;
    });
    it('nestedRoutes', function () {
        var routes = {
            path: '/',
            action: utils_1.noop,
            children: [{
                    path: '/general',
                    label: 'General',
                    action: utils_1.noop,
                    children: [{
                            path: '/users',
                            label: 'User Management',
                            action: utils_1.noop,
                            children: []
                        }]
                }, {
                    path: '/about',
                    label: 'About',
                    action: utils_1.noop,
                    children: []
                }]
        };
        var parsedRoutes = router_1.parseNestedRoutes(routes);
        assert.deepEqual(parsedRoutes.routes, {
            '/': utils_1.noop,
            '/general': utils_1.noop,
            '/general/users': utils_1.noop,
            '/about': utils_1.noop,
        });
        assert.deepEqual(Object.keys(parsedRoutes.meta), ['/', '/general', '/general/users', '/about']);
        assert.deepEqual(parsedRoutes.meta['/general'].path, '/general');
        assert.deepEqual(parsedRoutes.meta['/'].parents, []);
        assert.deepEqual(parsedRoutes.meta['/general'].label, 'General');
        assert.deepEqual(parsedRoutes.meta['/general'].parents.length, 1, 'general.parents.length should be 1');
        assert.deepEqual(parsedRoutes.meta['/general'].parents[0].path, '/');
        assert.deepEqual(parsedRoutes.meta['/general'].children.length, 1);
        assert.deepEqual(parsedRoutes.meta['/general'].children[0].path, '/users');
        assert.deepEqual(parsedRoutes.meta['/general/users'].parents.length, 2);
        assert.deepEqual(parsedRoutes.meta['/general/users'].parents[1].path, '/general');
    });
});
//# sourceMappingURL=router.test.js.map