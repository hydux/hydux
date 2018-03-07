import * as Cmd from './cmd'
import { ActionCmdResult } from './index'

declare global {
  type Dt<T extends string, D = undefined> = {
    tag: T,
    data: D
  } & { __tsTag: 'DateType' }
}

export function dt<T extends string, D = undefined>(tag: T, data?: D) {
  return { tag, data } as Dt<T, D>
}

export const never = (f: never) => f

export const mkInit = <S, A>(state: S, cmd: Cmd.CmdType<A> = Cmd.none): () => ActionCmdResult<S, A> => () => [state, cmd]
