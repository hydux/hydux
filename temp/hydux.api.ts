// @public (undocumented)
interface ActionObjReturen<S, A> {
  // (undocumented)
  cmd?: CmdType<A>;
  // (undocumented)
  state?: Partial<S>;
}

// @public (undocumented)
export function app<State, Actions>(props: AppProps<State, Actions>): Context<State, Actions>;

// @public (undocumented)
interface AppProps<State, Actions> {
  // (undocumented)
  actions: ActionsType<State, Actions>;
  // (undocumented)
  init: Init<State, Actions>;
  mutable?: boolean;
  // (undocumented)
  onRender?: (view: any) => void;
  // (undocumented)
  onUpdated?: OnUpdate<State, Actions>;
  // (undocumented)
  onUpdateStart?: OnUpdateStart<State, Actions>;
  // (undocumented)
  subscribe?: Subscribe<State, Actions>;
  // (undocumented)
  view: View<State, Actions>;
}

// @public (undocumented)
export function combine<T extends {
    [k: string]: [Component, InitObjReturn<any, any>];
}, A extends {
    [k: string]: any;
}>(arg: T, _acts?: A): CombinedComps<T, A>;

// @public (undocumented)
interface CombinedComps<T extends {
    [k: string]: [Component, InitObjReturn<any, any>];
}, A extends {
    [k: string]: any;
}> {
  actions: {
          [k in keyof T]: T[k][0]['actions'];
      };
  cmd: Cmd.Sub<A>[];
  cmds: {
          [k in keyof T]: Cmd.Sub<A>[];
      };
  render: <K extends Extract<keyof T, keyof S>, S>(k: K, state: S, actions: ActionsType<S, any>) => any;
  state: {
          [k in keyof T]: T[k][1]['state'];
      };
  views: {
          [k in keyof T]: T[k][0]['view'];
      };
}

// @public (undocumented)
interface Component<State = any, Actions = any> {
  // (undocumented)
  actions: ActionsType<State, Actions>;
  // (undocumented)
  init: Init<State, Actions>;
  // (undocumented)
  view: View<State, Actions> | ((...args: any[]) => any);
}

// @public (undocumented)
export function compose<T1, T2, T3, T4, T5, T6, T7, T8, T9, R>(fn1: Fn1<T1, T2>, fn2: Fn1<T2, T3>, fn3: Fn1<T3, T4>, fn4: Fn1<T4, T5>, fn5: Fn1<T5, T6>, fn6: Fn1<T6, T7>, fn7: Fn1<T7, T8>, fn8: Fn1<T8, T9>, fn9: Fn1<T9, R>): Fn1<T1, R>;

// @public (undocumented)
interface Context<State, Actions, RenderReturn = any> {
  // (undocumented)
  actions: Actions;
  // (undocumented)
  init: Init<State, Actions>;
  // (undocumented)
  onRender?: ((view: any) => RenderReturn);
  // (undocumented)
  onUpdated?: OnUpdate<State, Actions>;
  // (undocumented)
  onUpdateStart?: OnUpdateStart<State, Actions>;
  patch: Patch;
  // (undocumented)
  render(state?: State): RenderReturn;
  // (undocumented)
  state: State;
  // (undocumented)
  subscribe?: Subscribe<State, Actions>;
  // (undocumented)
  view: View<State, Actions>;
}

// @public (undocumented)
export function app<State, Actions>(props: AppProps<State, Actions>): Context<State, Actions>;

// @public (undocumented)
export function defaults<T>(value: T | null | undefined, defaults: T): T;

// WARNING: Unsupported export "active" Currently the "namespace" block only supports constant variables.
// WARNING: Unsupported export "deactive" Currently the "namespace" block only supports constant variables.
// WARNING: Export "getResult" is missing the "const" modifier. Currently the "namespace" block only supports constant variables.
// WARNING: Export "getContext" is missing the "const" modifier. Currently the "namespace" block only supports constant variables.
// WARNING: Unsupported export "Mapper" Currently the "namespace" block only supports constant variables.
// WARNING: Unsupported export "CmdHelper" Currently the "namespace" block only supports constant variables.
// WARNING: Unsupported export "ActiveProps" Currently the "namespace" block only supports constant variables.
// @public (undocumented)
module dispatcher {
}

// @public (undocumented)
export function hashAny(key: any): any;

// @public (undocumented)
interface InitObjReturn<S, A> {
  // (undocumented)
  cmd?: CmdType<A>;
  // (undocumented)
  state: S;
}

// @public (undocumented)
export function inject<S, A>(s?: S, a?: A): InjectContext<S, A>;

// @public (undocumented)
export function isFn(data: any): data is Function;

// @public (undocumented)
export function memoizeBind<A, B, C, D, E, F, Res>(callback: (a: A, b: B, c: C, d: D, e: E, f: F, ...args: any[]) => Res, a: A, b: B, c: C, d: D, e: E, f: F): (...args: any[]) => Res;

// @public
export function memoizeOne<P extends object, R>(fn: (props: P) => R, excludes?: string[]): ((props: P) => R);

// @public (undocumented)
export function merge<S>(to: S, from: Partial<S>): S;

// @public (undocumented)
export function mkInit<S, A>(state: S, cmd?: Cmd.CmdType<A>): ActionCmdReturn<S, A>;

// @public (undocumented)
export function normalize<S, A>(initResult: InitReturn<S, A>): Required<InitObjReturn<S, A>>;

// @public (undocumented)
export function overrideAction<S, A, PS, PA, A1, A2, A3, A4>(parentActions: PA, getter: (_: PA) => (a1: A1, a2: A2, a3: A3, a4: A4) => any, wrapper?: (a1: A1, a2: A2, a3: A3, a4: A4) => (action: <S = any, A = any>(a1: A1, a2: A2, a3: A3, a4: A4) => StandardActionReturn<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionReturn<S, A>): any;

// @public (undocumented)
export function runCmd<A>(cmd: CmdType<A>, actions: A): any[];

// @public (undocumented)
export function set<S>(to: S, from: Partial<S>): S;

// @public (undocumented)
export function setCacheOptions(opts: LRUCache.Options): void;

// @public (undocumented)
export function setDeep<S, V>(path: string[], value: V, from: S): S;

// @public (undocumented)
interface Sub<Actions> {
  // (undocumented)
  (actions: Actions): any;
}

// @public (undocumented)
export function withParents<S, A, PS, PA, A1, A2, A3, A4, A5>(action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => (s: S, a: A) => any, wrapper?: (action: (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5) => StandardActionReturn<S, A>, parentState: PS, parentActions: PA, state: S, actions: A) => ActionReturn<S, A>): any;

// WARNING: Unsupported export: Cmd
// WARNING: Unsupported export: CmdType
// WARNING: Unsupported export: ActionReturn
// WARNING: Unsupported export: noop
// WARNING: Unsupported export: isPojo
// WARNING: Unsupported export: Init
// WARNING: Unsupported export: View
// WARNING: Unsupported export: Subscribe
// WARNING: Unsupported export: OnUpdate
// WARNING: Unsupported export: OnUpdateStart
// WARNING: Unsupported export: Patch
// WARNING: Unsupported export: App
// WARNING: Unsupported export: Enhancer
// WARNING: Unsupported export: Dt
// WARNING: Unsupported export: never
// WARNING: Unsupported export: Fn1
// WARNING: Unsupported export: ActionState
// WARNING: Unsupported export: InitReturn
// WARNING: Unsupported export: ActionCmdReturn
// WARNING: Unsupported export: StandardActionReturn
// WARNING: Unsupported export: SAR
// WARNING: Unsupported export: ActionType
// WARNING: Unsupported export: ActionType2
// WARNING: Unsupported export: GeneralActionType
// WARNING: Unsupported export: ActionsType
// WARNING: Unsupported export: AR
// WARNING: Unsupported export: ACR
// (No @packagedocumentation comment for this package)
