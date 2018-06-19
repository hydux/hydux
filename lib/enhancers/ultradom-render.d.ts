import { Component, VNode } from 'ultradom';
import { App } from '../index';
declare const React: {
    createElement: typeof h;
};
export { React };
export declare function h<Props>(type: Component<Props> | string, props?: Props, ...children: Array<VNode<{}> | string | number | null>): VNode<Props>;
export default function withUltradom<State, Actions>(container?: Element, options?: {
    raf?: boolean;
}): (app: App<State, Actions>) => App<State, Actions>;
