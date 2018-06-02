let objUid = 0
let objUidKey = typeof Symbol !== 'undefined' ? Symbol('_hmuid_') : '_hmuid_'
let objUidMap = typeof WeakMap !== 'undefined' ? new WeakMap<object, number>() : null

function getType(key: any) {
  const t: string = Object.prototype.toString.call(key)
  return t.slice(8, -1).toLowerCase()
}

export default function hash(key: any) {
  switch (getType(key)) {
    case 'undefined':
    case 'null':
    case 'boolean':
    case 'number':
    case 'regexp':
      return key + ''

    case 'date':
      return '📅' + key.getTime()

    case 'string':
      return '📝' + key

    case 'array':
      return '🔗' + (key as any[]).map(k => hash(k)).join('⁞')

    default:
      if (objUidMap) {
        let uid = objUidMap.get(key)
        if (!uid) {
          uid = ++objUid
          objUidMap.set(key, uid)
        }
        return '⭕️' + uid
      }
      if (!key.hasOwnProperty(objUidKey)) {
        key[objUidKey] = ++objUid
        hide(key, objUidKey)
      }

      return '⭕️' + key[objUidKey]
  }
}

function hide(obj, prop) {
  // Make non iterable if supported
  if (Object.defineProperty) {
    Object.defineProperty(obj, prop, { enumerable: false })
  }
}
