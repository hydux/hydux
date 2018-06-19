import { App } from './../index';
export declare type Options<State = any> = {
    logger?: (level: Required<Options>['level'], prevState: State, action: {
        name: string;
        data: any;
    }, nextState: State, extra: any[]) => void;
    level?: 'debug' | 'info' | 'log' | 'warn' | 'error';
    windowInspectKey?: string;
    filter?: (actionPath: string) => boolean;
    logActionTime?: boolean;
    logRenderTime?: boolean;
};
export default function withLogger<State, Actions>(options?: Options<State>): (app: App<State, Actions>) => App<State, Actions>;
