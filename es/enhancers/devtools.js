import { connectViaExtension, extractState } from 'remotedev';
import Cmd from '../cmd';
export default function withDevtools(options) {
    options = Object.assign({ remote: false, hostname: 'remotedev.io', port: 443, secure: true, getActionType: f => f, debounce: 10, filter: _ => true, jsonToState: f => f, stateToJson: f => f }, options);
    const { jsonToState, stateToJson } = options;
    const connection = connectViaExtension(options);
    let timer;
    return (app) => (props) => {
        const ctx = app(Object.assign({}, props, { init: () => {
                const result = props.init();
                const state = (result instanceof Array) ? result[0] : result;
                connection.init(stateToJson(state));
                return result;
            }, onUpdate: (data) => {
                props.onUpdate && props.onUpdate(data);
                if (!options.filter(data.action)) {
                    return;
                }
                const send = () => connection.send({
                    type: 'update',
                    msg: { data: data.msgData, type: data.action },
                }, stateToJson(data.nextAppState));
                timer && clearTimeout(timer);
                timer = setTimeout(send, options.debounce);
            }, subscribe: (model) => {
                function sub(actions) {
                    connection.subscribe(function (msg) {
                        if (msg.type === 'DISPATCH') {
                            switch (msg.payload.type) {
                                case 'JUMP_TO_ACTION':
                                case 'JUMP_TO_STATE':
                                    ctx.render(jsonToState(extractState(msg)));
                                    break;
                                case 'IMPORT_STATE':
                                    const states = msg.payload.nextLiftedState.computedStates;
                                    const state = states[states.length - 1];
                                    ctx.render(jsonToState(state.state));
                                    connection.send(null, msg.payload.nextLiftedState);
                            }
                        }
                    });
                }
                return props.subscribe
                    ? Cmd.batch([sub], props.subscribe(model))
                    : [sub];
            } }));
        return ctx;
    };
}
//# sourceMappingURL=devtools.js.map