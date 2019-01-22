import { Cmd, CmdType, Sub } from './cmd'
import { ActionType } from './types'
import { set } from './utils';

export function inject<S, A>(s?: S, a?: A): dispatcher.InjectContext<S, A> {
  let ctx = dispatcher.getContext()
  return ctx
}

export namespace dispatcher {
  export let getResult = () => {
    let ctx = contextStack[contextStack.length - 1]
    if (!ctx) return
    return {
      state: ctx._internals.newState,
      cmd: ctx._internals.cmd,
    }
  }
  export let getContext = () => {
    checkActive()
    return contextStack[contextStack.length - 1]
  }
  let checkActive = () => {
    if (!contextStack.length) {
      throw new RangeError(`addCmd is called out of scope, please ensure it is called in a synchronized action.`)
    }
  }
  export type Mapper<A, SubA> = ((a: A) => SubA) | null
  export class CmdHelper<S = any, A = any> {
    none = Cmd.none

    constructor(
      public readonly setState: (s: Partial<S>) => void,
      private readonly _mapper?: Mapper<any, A>,
    ) {}
    map<SubA>(mapper: Mapper<A, SubA>) {
      return new CmdHelper(this.setState, mapper)
    }

    addSub(...subs: Sub<A>[]) {
      this._addCmd(Cmd.ofSub, subs)
      return this
    }

    addFn<Arg, T>(
      task?: () => T,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    )
    addFn<Arg, T>(
      task?: (args?: Arg) => T,
      args?: Arg,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    ) {
      this._addCmd(Cmd.ofFn, arguments)
      return this
    }

    addPromise<Arg, T>(
      task: (arg: Arg) => Promise<T>,
      args: Arg,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    )
    addPromise<Arg, T>(
      task: () => Promise<T>,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    )
    addPromise<Arg, T>(
      task: (args?: Arg) => Promise<T>,
      args?: Arg,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    ) {
      this._addCmd(Cmd.ofPromise, arguments)
      return this
    }

    private _addCmd(fn, args) {
      let ctx = getContext()
      let cmd: CmdType<any> = (fn as any)(...args)
      if (this._mapper) {
        cmd = cmd.map(c => a => c(this._mapper!(a)))
      }
      ctx._internals.cmd.push(...cmd)
      return cmd
    }
  }

  let contextStack = [] as (ReturnType<typeof makeContext>)[]
  export interface ActiveProps {
    state: any
    actions: any
    parentState: any
    parentActions: any
    setState: (s: any, callback?: any) => any
  }
  export class InjectContext<S, A = any> extends CmdHelper<S, A> {
    state: S
    actions: A
    setState: (s: Partial<S>, callback?: () => void) => InjectContext<S, A>
    parentState: any
    parentActions: any
    Cmd: CmdHelper<S, A>
    /** @internal */
    _internals: {
      newState: S
      cmd: CmdType<any>,
    }
    constructor(
      props: ActiveProps,
      setState: (s: Partial<S>, callback?: () => void) => InjectContext<S, A>,
    ) {
      super(setState)
      set(this as InjectContext<any, any>, props)
      this._internals = {
        newState: props.state,
        cmd: [],
      }
      this.setState = setState
      this.Cmd = new CmdHelper(setState)
    }
  }
  function makeContext(props: ActiveProps) {
    let setState = (state, callback) => {
      ctx._internals.newState = state
      props.setState(state, callback)
      return ctx
    }
    let ctx = new InjectContext(props, setState)
    return ctx
  }
  export function active<S>(props: ActiveProps) {
    contextStack.push(makeContext(props))
  }
  export function deactive() {
    contextStack.pop()
  }
}
