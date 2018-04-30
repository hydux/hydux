import { noop } from './../../utils';
import * as assert from 'assert';
import { parsePath, matchPath, parseNestedRoutes } from '../../enhancers/router';
describe('router', function () {
    it('parsePath simple', function () {
        var loc = parsePath('/aa/bb?aa=bb&aa=cc&cc=dd', []);
        assert.deepEqual(loc.params, {}, 'params should be empty obj');
        assert.deepEqual(loc.pathname, '/aa/bb');
        assert.deepEqual(loc.search, '?aa=bb&aa=cc&cc=dd');
        assert.deepEqual(loc.query.aa, ['bb', 'cc']);
        assert.deepEqual(loc.query.cc, 'dd');
        assert.deepEqual(loc.template, null);
    });
    it('parsePath encode', function () {
        var loc = parsePath('/user/%E5%B0%8F%E6%98%8E?aa=vv&aa=%E5%B0%8F%E6%98%8E&aa=badas', []);
        assert.deepEqual(loc.params, {}, 'params should be empty obj');
        assert.deepEqual(loc.pathname, '/user/小明', 'pathname');
        assert.deepEqual(loc.search, '?aa=vv&aa=%E5%B0%8F%E6%98%8E&aa=badas');
        assert.deepEqual(loc.query.aa, ['vv', '小明', 'badas']);
        assert.deepEqual(loc.template, null);
    });
    it('matchPath simple', function () {
        var params = matchPath('/aa/bb/cc', '/aa/bb/cc');
        assert.deepEqual(params, {}, 'params');
        params = matchPath('/aa/bb/cc', '/aa/bb/cc/');
        assert.deepEqual(params, {}, 'match');
        params = matchPath('/aa/bb/cc/', '/aa/bb/cc');
        assert.deepEqual(params, {}, 'match');
        params = matchPath('/aa/bb/cc/', '/aa/bb/cc/');
        assert.deepEqual(params, {}, 'match');
        params = matchPath('/aa/bb/cc', '/aa/bb/cd');
        assert.deepEqual(params, null, 'match');
        params = matchPath('/aa/bb/cc', '/aa/ba/cc');
        assert.deepEqual(params, null, 'match');
        params = matchPath('/aa/bb/cc', '/aa/bb');
        assert.deepEqual(params, null, 'match');
        params = matchPath('/aa/bb/', '/aa/bb/cc/');
        assert.deepEqual(params, null, 'match');
    });
    it('nestedRoutes', function () {
        var routes = {
            path: '/',
            action: noop,
            children: [{
                    path: '/general',
                    label: 'General',
                    action: noop,
                    children: [{
                            path: '/users',
                            label: 'User Management',
                            action: noop,
                            children: []
                        }]
                }, {
                    path: '/about',
                    label: 'About',
                    action: noop,
                    children: []
                }]
        };
        var parsedRoutes = parseNestedRoutes(routes);
        assert.deepEqual(parsedRoutes.routes, {
            '/': noop,
            '/general': noop,
            '/general/users': noop,
            '/about': noop,
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