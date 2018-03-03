import Cmd from './../cmd';
export default function withPersist(props = {}) {
    const { store = localStorage, serialize = JSON.stringify, deserialize = JSON.parse, debounce = 50, key = 'hydux-persist', } = props;
    let timer;
    return (app) => (props) => {
        return app(Object.assign({}, props, { init: () => {
                let result = props.init();
                if (!(result instanceof Array)) {
                    result = [result, Cmd.none];
                }
                const persistState = store.getItem(key);
                if (persistState) {
                    result[0] = deserialize(persistState);
                }
                return [result[0], result[1]];
            }, onUpdate: (data) => {
                props.onUpdate && props.onUpdate(data);
                timer && clearTimeout(timer);
                const persist = () => store.setItem(key, serialize(data.nextAppState));
                timer = setTimeout(persist, debounce);
            } }));
    };
}
//# sourceMappingURL=persist.js.map