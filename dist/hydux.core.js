!function(n,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.core=t():(n.hydux=n.hydux||{},n.hydux.core=t())}("undefined"!=typeof self?self:this,function(){return function(n){function t(r){if(e[r])return e[r].exports;var o=e[r]={i:r,l:!1,exports:{}};return n[r].call(o.exports,o,o.exports,t),o.l=!0,o.exports}var e={};return t.m=n,t.c=e,t.d=function(n,e,r){t.o(n,e)||Object.defineProperty(n,e,{configurable:!1,enumerable:!0,get:r})},t.n=function(n){var e=n&&n.__esModule?function(){return n.default}:function(){return n};return t.d(e,"a",e),e},t.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},t.p="",t(t.s=12)}({1:function(n,t,e){"use strict";function r(n,t){for(var e=Object.keys(t),r=e.length;r--;){var o=e[r];n[o]=t[o]}return n}function o(n,e){return r(r(t.isPojo(n)?{}:new n.constructor,n),e)}function u(n){return r(t.isPojo(n)?{}:new n.constructor,n)}function c(n,e,r){var u=t.isPojo(r)?{}:new r.constructor;return 0===n.length?e:(u[n[0]]=1<n.length?c(n.slice(1),e,r[n[0]]):e,o(r,u))}function i(n,t){for(var e=n.length,r=0;r<e;r++)t=t[n[r]];return t}function f(n){return"function"==typeof n}Object.defineProperty(t,"__esModule",{value:!0});var a=function(n){return void 0!==n&&null!==n};t.isPojo=function(n){return!a(n.constructor)||n.constructor===Object},t.set=r,t.merge=o,t.clone=u,t.setDeep=c,t.get=i,t.isFn=f,t.noop=function(n){return n}},12:function(n,t,e){"use strict";function r(n,t,e){var r=n;return i.isFn(r)&&(r=r(t,e))&&i.isFn(r)&&(r=r(e)),void 0===r||r.then&&i.isFn(r.then)?[t,c.default.none]:r instanceof Array?r:[r,c.default.none]}function o(n){function t(t){void 0===t&&(t=p),t!==p&&(p=t);var e;return i.isFn(e=n.view(p,o))&&(e=e(o)),a(e)}function e(o,u,f,a){for(var s in f)!function(s){if(/^_/.test(s))return"continue";var l=f[s];i.isFn(l)?u[s]=function(){for(var e=[],d=0;d<arguments.length;d++)e[d]=arguments[d];o=i.get(a,p);var v=o,y=p,h=c.default.none;b=r(l.apply(f,e),o,u),v=b[0],h=b[1],n.onUpdate&&(y=i.setDeep(a,i.merge(o,v),p),n.onUpdate({prevAppState:p,nextAppState:y,msgData:e,action:a.concat(s).join(".")})),v!==o&&(p=y!==p?y:i.setDeep(a,i.merge(o,v),p),t(p)),h.forEach(function(n){return n(u)});var b}:"object"==typeof l&&l&&e(o[s]||(o[s]={}),u[s]=i.clone(l),l,a.concat(s))}(s)}var o={},f=n.subscribe||function(n){return c.default.none},a=n.onRender||i.noop,s=r(n.init(),void 0,o),p=s[0],l=s[1];return e(p,o,n.actions,[]),l.forEach(function(n){return n(o)}),t(p),f(p).forEach(function(n){return n(o)}),u({},n,{actions:o,getState:function(){return p},render:t})}var u=this&&this.__assign||Object.assign||function(n){for(var t,e=1,r=arguments.length;e<r;e++){t=arguments[e];for(var o in t)Object.prototype.hasOwnProperty.call(t,o)&&(n[o]=t[o])}return n};Object.defineProperty(t,"__esModule",{value:!0});var c=e(2);t.Cmd=c.default;var i=e(1);t.noop=i.noop,t.runAction=r,t.default=o},2:function(n,t,e){"use strict";function r(n,t,e,r){return n?(u.isFn(t)&&(r=e,e=t,t=void 0),[function(o){try{var u=n(t);u&&e&&e(u)}catch(n){r&&r(n)}}]):[]}function o(n,t,e,r){return n?(u.isFn(t)&&(r=e,e=t,t=void 0),[function(o){n(t).then(e).catch(r)}]):[]}Object.defineProperty(t,"__esModule",{value:!0});var u=e(1);t.default={none:[],ofPromise:o,ofFn:r,ofSub:function(n){return[n]},batch:function(){for(var n=[],t=0;t<arguments.length;t++)n[t]=arguments[t];var e=Array.prototype.concat;return e.apply([],e.apply([],n))},map:function(n,t){return t.map(function(t){return function(e){return t(n(e))}})}}}})});
//# sourceMappingURL=hydux.core.js.map