export type Dt<T extends string, D = undefined> = {
  tag: T,
  data: D
}

export function dt<T extends string, D = undefined>(tag: T, data?: D) {
  return { tag, data }
}
export const never = (f: never) => f
