export function set(to, from) {
    for (var i in from) {
        to[i] = from[i];
    }
    return to;
}
export function merge(to, from) {
    return set(set({}, to), from);
}
export function setDeep(path, value, from) {
    var to = {};
    return 0 === path.length
        ? value
        : ((to[path[0]] =
            1 < path.length
                ? setDeep(path.slice(1), value, from[path[0]])
                : value),
            merge(from, to));
}
export function get(path, from) {
    for (var i = 0; i < path.length; i++) {
        from = from[path[i]];
    }
    return from;
}
export function isFunction(data) {
    return 'function' === typeof data;
}
export var noop = function (f) { return f; };
//# sourceMappingURL=utils.js.map