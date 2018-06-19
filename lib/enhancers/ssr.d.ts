import { App } from './../index';
export declare type Options = {
    renderToString: (view: any) => string;
};
export default function withSSR<State, Actions>(options: Options): (app: App<State, Actions>) => App<State, Actions>;
