import { Cmd, CmdType, Sub } from './cmd'
import { ActionType } from './types'

export interface InjectContext<S, A> {
  state: S
  actions: A,
  setState: (state: Partial<S>) => void
  Cmd: dispatcher.CmdHelper<S, A>
}
export function inject<S, A>(s?: S, a?: A): InjectContext<S, A> {
  let ctx = dispatcher.getContext()
  return {
    state: ctx.state,
    actions: ctx.actions,
    setState: ctx.setState,
    Cmd: ctx.Cmd
  }
}

export namespace dispatcher {
  export let getResult = () => {
    let ctx = contextStack[contextStack.length - 1]
    if (!ctx) return
    return {
      state: ctx.newState,
      cmd: ctx.cmd,
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
      private _mapper?: Mapper<any, A>
    ) {}
    map<SubA>(mapper: Mapper<A, SubA>) {
      return new CmdHelper(mapper)
    }

    addSub(...subs: Sub<A>[]): void {
      this._addCmd(Cmd.ofSub, subs)
    }

    addFn<Arg, T>(
      task?: () => T,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    ): void
    addFn<Arg, T>(
      task?: (args?: Arg) => T,
      args?: Arg,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    ): void {
      this._addCmd(Cmd.ofFn, arguments)
    }

    addPromise<Arg, T>(
      task: (arg: Arg) => Promise<T>,
      args: Arg,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    ): void
    addPromise<Arg, T>(
      task: () => Promise<T>,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    ): void
    addPromise<Arg, T>(
      task: (args?: Arg) => Promise<T>,
      args?: Arg,
      succeedAction?: ActionType<T, S, A>,
      failedAction?: ActionType<Error, S, A>
    ): void {
      this._addCmd(Cmd.ofPromise, arguments)
    }

    private _addCmd(fn, args) {
      let ctx = getContext()
      let cmd: CmdType<any> = (fn as any)(...args)
      if (this._mapper) {
        cmd = cmd.map(c => a => c(this._mapper!(a)))
      }
      ctx.cmd.push(...cmd)
      return cmd
    }
  }

  let contextStack = [] as (ReturnType<typeof makeContext>)[]
  export interface ActiveProps {
    state: any
    actions: any
    parentState: any
    parentActions: any
    setState: (s) => void
  }
  function makeContext(props: ActiveProps) {
    let ctx = {
      ...props,
      newState: props.state,
      setState: (state) => {
        ctx.newState = state
        return props.setState(state)
      },
      Cmd: new CmdHelper(),
      cmd: [] as CmdType<any>,
      mapper: null as any,
    }
    return ctx
  }
  export function active<S>(props: ActiveProps) {
    contextStack.push(makeContext(props))
  }
  export function deactive() {
    contextStack.pop()
  }
}
