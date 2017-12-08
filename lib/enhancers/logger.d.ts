import { App } from './../index';
export default function withLogger<State, Actions>({logger}?: {
    logger?: (prevState: any, action: any, nextState: any) => void;
}): (app: App<State, Actions>) => App<State, Actions>;
