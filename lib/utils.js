"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function set(to, from) {
    for (var i in from) {
        to[i] = from[i];
    }
    return to;
}
exports.set = set;
function merge(to, from) {
    return set(set(to ? new to.constructor() : {}, to), from);
}
exports.merge = merge;
function setDeep(path, value, from) {
    var to = from ? new from.constructor() : {};
    return 0 === path.length
        ? value
        : ((to[path[0]] =
            1 < path.length
                ? setDeep(path.slice(1), value, from[path[0]])
                : value),
            merge(from, to));
}
exports.setDeep = setDeep;
function get(path, from) {
    for (var i = 0; i < path.length; i++) {
        from = from[path[i]];
    }
    return from;
}
exports.get = get;
function isFunction(data) {
    return 'function' === typeof data;
}
exports.isFunction = isFunction;
exports.noop = function (f) { return f; };
//# sourceMappingURL=utils.js.map