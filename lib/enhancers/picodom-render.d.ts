import { Component, VNode } from 'picodom';
import { App } from '../index';
declare const React: {
    createElement: <Props>(type: string | Component<Props>, props?: Props | undefined, ...children: (string | number | VNode<{}> | null)[]) => VNode<Props>;
};
export { React };
export declare function h<Props>(type: Component<Props> | string, props?: Props, ...children: Array<VNode<{}> | string | number | null>): VNode<Props>;
export default function withPicodom<State, Actions>(container?: HTMLElement, options?: {
    raf?: boolean;
}): (app: App<State, Actions>) => App<State, Actions>;
