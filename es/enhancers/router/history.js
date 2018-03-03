export class BaseHistory {
    constructor(props = {}) {
        this.listeners = [];
        this.last = () => this._last[0];
        this.listen = listener => this.listeners.push(listener);
        this.props = Object.assign({ basePath: '' }, props);
        this._last = [this.current()];
        this.listeners.push(path => {
            this._last = [this._last[this._last.length - 1], path];
        });
    }
    go(delta) {
        history.go(delta);
    }
    back() {
        history.back();
    }
    forward() {
        history.forward();
    }
    _setLoc(loc) {
        this.lastLocation = this.location || loc;
        this.location = loc;
    }
    handleChange(path = this.current()) {
        this.listeners.forEach(f => f(path));
    }
}
export class HashHistory extends BaseHistory {
    constructor(props = {}) {
        super(props);
        this.props = props = Object.assign({ hash: '#!' }, this.props);
        window.addEventListener('hashchange', e => {
            this.handleChange();
        });
    }
    getRealPath(path) {
        return this.props.hash + this.props.basePath + path;
    }
    current() {
        return location.hash.slice(this.props.hash.length + this.props.basePath.length) || '/';
    }
    push(path) {
        location.assign(this.getRealPath(path));
    }
    replace(path) {
        location.replace(this.getRealPath(path));
    }
}
export class BrowserHistory extends BaseHistory {
    constructor(props = {}) {
        super(props);
        window.addEventListener('popstate', e => {
            this.handleChange();
        });
    }
    getRealPath(path) {
        return this.props.basePath + path;
    }
    current() {
        return location.pathname.slice(this.props.basePath.length)
            + location.search;
    }
    push(path) {
        history.pushState(null, '', this.getRealPath(path));
        this.handleChange(path);
    }
    replace(path) {
        history.replaceState(null, '', this.getRealPath(path));
        this.handleChange(path);
    }
}
export class MemoryHistory extends BaseHistory {
    constructor(props = {}) {
        super(props);
        this._index = 0;
        this.props = props = Object.assign({ initPath: '/' }, this.props);
        this._stack = [this.props.basePath + this.props.initPath];
    }
    getRealPath(path) {
        return this.props.basePath + path;
    }
    current() {
        return this._stack[this._index].slice(this.props.basePath.length);
    }
    push(path) {
        this._reset();
        this._stack.push(this.props.basePath + path);
        this.handleChange(path);
    }
    replace(path) {
        this._reset();
        this._stack[this._index] = this.props.basePath + path;
        this.handleChange(path);
    }
    go(delta) {
        let next = this._index + delta;
        next = Math.min(next, this._stack.length - 1);
        next = Math.max(next, 0);
        this._index = next;
    }
    back() {
        this.go(-1);
    }
    forward() {
        this.go(1);
    }
    _reset() {
        this._stack = this._stack.slice(0, this._index + 1);
    }
}
//# sourceMappingURL=history.js.map