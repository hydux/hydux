import { App } from './../index';
export default function withDevtools<State, Actions>(options: any): (app: App<State, Actions>) => App<State, Actions>;
