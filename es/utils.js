var isSet = function (val) { return typeof val !== 'undefined' && val !== null; };
export var isPojo = function (obj) { return !isSet(obj.constructor) || obj.constructor === Object; };
export var isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
export var debug = function (key) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    isDev && console.log.apply(console, ["[hydux-" + key + "]"].concat(args));
};
export function set(to, from) {
    var keys = Object.keys(from);
    var i = keys.length;
    while (i--) {
        var key = keys[i];
        to[key] = from[key];
    }
    return to;
}
export function merge(to, from) {
    return set(set(isPojo(to) ? {} : new to.constructor(), to), from);
}
export function clone(from) {
    return set(isPojo(from) ? {} : new from.constructor(), from);
}
export function setDeep(path, value, from) {
    var to = isPojo(from) ? {} : new from.constructor();
    return 0 === path.length
        ? value
        : ((to[path[0]] =
            1 < path.length
                ? setDeep(path.slice(1), value, from[path[0]])
                : value),
            merge(from, to));
}
export function get(path, from) {
    var len = path.length;
    for (var i = 0; i < len; i++) {
        from = from[path[i]];
    }
    return from;
}
export function isFn(data) {
    return 'function' === typeof data;
}
export var noop = function (f) { return f; };
//# sourceMappingURL=utils.js.map