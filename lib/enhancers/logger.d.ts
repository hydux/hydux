import { App } from './../index';
export default function withLogger<State, Actions>(options?: {
    logger?: (prevState: State, action: {
        name: string;
        data: any;
    }, nextState: State) => void;
    windowInspectKey?: string;
    filter?: (actionPath: string) => boolean;
}): (app: App<State, Actions>) => App<State, Actions>;
