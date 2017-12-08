import { App } from './../index';
export default function withLogger<State, Actions>({logger, windowInspectKey}?: {
    logger?: (prevState: any, action: any, nextState: any) => void;
    windowInspectKey?: string;
}): (app: App<State, Actions>) => App<State, Actions>;
