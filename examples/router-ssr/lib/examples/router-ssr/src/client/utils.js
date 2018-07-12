import * as _fetch from 'isomorphic-fetch';
export function fetch(input, init) {
    return _fetch('http://127.0.0.1:3456' + input, init);
}
// todo: Inject ctx in actions/views
//# sourceMappingURL=utils.js.map