import { h, Component, VNode } from 'picodom';
import { App } from '../index';
declare const React: {
    createElement: {
        <Props>(type: string | Component<Props>, props?: Props | undefined, ...children: (string | number | VNode<{}> | null)[]): VNode<Props>;
        <Props>(tag: string | Component<Props>, props?: Props | undefined, children?: (string | number | VNode<{}> | null)[] | undefined): VNode<Props>;
    };
};
export { h, React };
export default function withPicodom<State, Actions>(container?: HTMLElement): (app: App<State, Actions>) => App<State, Actions>;
