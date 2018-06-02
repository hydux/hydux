"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var objUid = 0;
var objUidKey = typeof Symbol !== 'undefined' ? Symbol('_hmuid_') : '_hmuid_';
var objUidMap = typeof WeakMap !== 'undefined' ? new WeakMap() : null;
function getType(key) {
    var t = Object.prototype.toString.call(key);
    return t.slice(8, -1).toLowerCase();
}
function hash(key) {
    switch (getType(key)) {
        case 'undefined':
        case 'null':
        case 'boolean':
        case 'number':
        case 'regexp':
            return key + '';
        case 'date':
            return '📅' + key.getTime();
        case 'string':
            return '📝' + key;
        case 'array':
            return '🔗' + key.map(function (k) { return hash(k); }).join('⁞');
        default:
            if (objUidMap) {
                var uid = objUidMap.get(key);
                if (!uid) {
                    uid = ++objUid;
                    objUidMap.set(key, uid);
                }
                return '⭕️' + uid;
            }
            if (!key.hasOwnProperty(objUidKey)) {
                key[objUidKey] = ++objUid;
                hide(key, objUidKey);
            }
            return '⭕️' + key[objUidKey];
    }
}
exports.default = hash;
function hide(obj, prop) {
    // Make non iterable if supported
    if (Object.defineProperty) {
        Object.defineProperty(obj, prop, { enumerable: false });
    }
}
//# sourceMappingURL=hash.js.map