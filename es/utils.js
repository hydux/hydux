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
    for (var i = 0; i < keys.length; i++) {
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
    if (path.length === 0) {
        return value;
    }
    var to = isPojo(from)
        ? {} : new from.constructor();
    var toCursor = to;
    var fromCursor = from;
    var lastIdx = path.length - 1;
    set(toCursor, fromCursor);
    for (var i = 0; i < lastIdx; i++) {
        var key = path[i];
        toCursor = toCursor[key];
        fromCursor = fromCursor[key];
        set(toCursor, fromCursor);
    }
    toCursor[path[lastIdx]] = value;
    return to;
}
export function setDeepMutable(path, value, from) {
    var cursor = from;
    for (var i = 0; i < path.length - 1; i++) {
        cursor = cursor[path[i]];
    }
    cursor[path[path.length - 1]] = value;
    return from;
}
export function get(path, from, len) {
    if (len === void 0) { len = path.length; }
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