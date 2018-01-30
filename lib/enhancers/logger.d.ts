import { App } from './../index';
export default function withLogger<State, Actions>(options?: {
    logger?: (prevState: State, action: {
        name: string;
        data: any;
    }, nextState: State, extra: any[]) => void;
    windowInspectKey?: string;
    filter?: (actionPath: string) => boolean;
    logActionTime?: boolean;
    logRenderTime?: boolean;
}): (app: App<State, Actions>) => App<State, Actions>;
