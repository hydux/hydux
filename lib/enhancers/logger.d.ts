import { App } from './../index';
export declare type Options<State> = {
    logger?: (prevState: State, action: {
        name: string;
        data: any;
    }, nextState: State, extra: any[]) => void;
    windowInspectKey?: string;
    filter?: (actionPath: string) => boolean;
    logActionTime?: boolean;
    logRenderTime?: boolean;
};
export default function withLogger<State, Actions>(options?: Options<State>): (app: App<State, Actions>) => App<State, Actions>;
