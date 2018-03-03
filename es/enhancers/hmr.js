let globalState;
export default function withHmr(options) {
    return (app) => (props) => app(Object.assign({}, props, { init() {
            let result = props.init();
            if (!(result instanceof Array)) {
                result = [result, []];
            }
            return [globalState || result[0], result[1]];
        },
        onUpdate(data) {
            props.onUpdate && props.onUpdate(data);
            globalState = data.nextAppState;
        } }));
}
//# sourceMappingURL=hmr.js.map