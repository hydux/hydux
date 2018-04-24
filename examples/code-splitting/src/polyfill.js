// @ts-nocheck
function noop(f) { return f }
window.localStorage = window.localStorage || {
  setItem: noop,
  getItem: noop,
}
