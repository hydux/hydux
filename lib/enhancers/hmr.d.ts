import { App } from './../index';
export default function withHmr<State, Actions>(options: any): (app: App<State, Actions>) => App<State, Actions>;
