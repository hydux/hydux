var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as assert from 'assert';
import * as getPort from 'get-port';
import * as Utils from './utils';
describe('code-splitting test', function () {
    var _this = this;
    this.timeout(Utils.timeout);
    var browser = null;
    var page = null;
    var port = 0;
    var hs = null;
    before(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Utils.launchBrowser()];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, getPort()];
                case 2:
                    port = _a.sent();
                    return [4 /*yield*/, Utils.runServer('code-splitting', port)];
                case 3:
                    hs = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    after(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('start close browser');
                    return [4 /*yield*/, browser.close()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, hs.kill()];
                case 2:
                    _a.sent();
                    console.log('end close browser');
                    return [2 /*return*/];
            }
        });
    }); });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, browser.newPage()];
                case 1:
                    page = _a.sent();
                    return [4 /*yield*/, page.goto("http://127.0.0.1:" + port)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    afterEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.close()];
                case 1:
                    _a.sent();
                    console.log('page closed');
                    return [2 /*return*/];
            }
        });
    }); });
    it('simple', function () { return __awaiter(_this, void 0, void 0, function () {
        var _text, routeTo, _a, _b, _c, _d, _e, _f;
        var _this = this;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0: return [4 /*yield*/, page.waitFor('.main')];
                case 1:
                    _g.sent();
                    _text = function (e, trim) {
                        if (trim === void 0) { trim = true; }
                        return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, Utils.sleep(100)];
                                    case 1:
                                        _a.sent();
                                        if (!(typeof e === 'string')) return [3 /*break*/, 3];
                                        return [4 /*yield*/, page.$$(e)];
                                    case 2:
                                        e = (_a.sent())[0];
                                        _a.label = 3;
                                    case 3: return [2 /*return*/, Utils.text(e, trim)];
                                }
                            });
                        });
                    };
                    routeTo = function (sel) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, page.$(sel)];
                                case 1: return [4 /*yield*/, (_a.sent()).click()];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, Utils.sleep(50)];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); };
                    _b = (_a = assert).equal;
                    return [4 /*yield*/, _text('.main')];
                case 2:
                    _b.apply(_a, [_g.sent(), 'home', "route home"]);
                    return [4 /*yield*/, routeTo('a.users')];
                case 3:
                    _g.sent();
                    _d = (_c = assert).equal;
                    return [4 /*yield*/, _text('.main')];
                case 4:
                    _d.apply(_c, [_g.sent(), 'User: 1', "route users"]);
                    return [4 /*yield*/, routeTo('a.counter')];
                case 5:
                    _g.sent();
                    return [4 /*yield*/, Utils.counterSuit(page, 0)];
                case 6:
                    _g.sent();
                    return [4 /*yield*/, routeTo('a.e404')];
                case 7:
                    _g.sent();
                    _f = (_e = assert).equal;
                    return [4 /*yield*/, _text('.main')];
                case 8:
                    _f.apply(_e, [_g.sent(), '404', 'route 404']);
                    return [4 /*yield*/, page.goto("http://127.0.0.1:" + port)
                        // page.on('console', e => {
                        //   console.log(e.text())
                        // })
                        // let loading = await page.evaluateHandle(
                        //   () => {
                        //     const a = document.querySelector('a.counter')! as HTMLLinkElement
                        //     a.click()
                        //     return new Promise(res => {
                        //       const loop = () => {
                        //         const text = (document.querySelector('.main')! as HTMLElement).innerText
                        //         console.log('text', text)
                        //         if (text.includes('Loading...')) {
                        //           clearInterval(t)
                        //           res(text)
                        //         }
                        //       }
                        //       loop()
                        //       let t = setInterval(loop, 1)
                        //     })
                        //   }
                        // )
                        // loading = await loading.jsonValue()
                        // assert.equal(loading, 'Loading...', 'loading')
                    ];
                case 9:
                    _g.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=code-splitting.test.js.map