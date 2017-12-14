const assert = require('assert')
import app, { Cmd } from '../index'
import logger from '../enhancers/logger'
function sleep(ns) {
  return new Promise(resolve => setTimeout(resolve, ns))
}
describe('router', () => {

})
