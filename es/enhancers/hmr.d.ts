import { App } from './../index';
export default function withHmr<State, Actions>(): (app: App<State, Actions>) => App<State, Actions>;
