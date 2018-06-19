"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Utils = require("./utils");
var child = require("child_process");
var util = require("util");
var pExec = util.promisify(child.exec);
function main() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _this = this;
        return tslib_1.__generator(this, function (_a) {
            Promise.all(['counter', 'router', 'code-splitting', 'router-ssr'].map(function (app) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                var execOpts, p;
                return tslib_1.__generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            execOpts = {
                                cwd: process.cwd() + "/examples/" + app,
                            };
                            console.log('Start building...: ', app);
                            return [4 /*yield*/, pExec('yarn --mutex=network', execOpts)];
                        case 1:
                            p = _a.sent();
                            console.log(p.stdout);
                            console.error(p.stderr);
                            return [4 /*yield*/, pExec('yarn build:dev', execOpts)];
                        case 2:
                            p = _a.sent();
                            console.log(p.stdout);
                            console.error(p.stderr);
                            return [2 /*return*/];
                    }
                });
            }); }));
            return [2 /*return*/];
        });
    });
}
main().catch(console.error);
Utils.downloadChrome();
//# sourceMappingURL=prepare.js.map