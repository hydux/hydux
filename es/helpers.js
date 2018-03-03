import * as Cmd from './cmd';
export function dt(tag, data) {
    return { tag, data };
}
export const never = (f) => f;
export const mkInit = (state, cmd = Cmd.none) => [state, cmd];
//# sourceMappingURL=helpers.js.map