// @ts-nocheck
const noop = f => f
window.localStorage = window.localStorage || {
  setItem: noop,
  getItem: noop,
}
