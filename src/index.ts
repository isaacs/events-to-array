import { EventEmitter } from 'events'

export type EventLog = [event: string | symbol, ...data: any[]][]
export const eventsToArray = (
  ee: EventEmitter,
  ignore: (string | symbol)[] = [],
  map = (x: any, _i: number, _arr: any[]) => x
) => {
  const array: EventLog = []

  const orig = ee.emit
  ee.emit = function (ev: string | symbol, ...args: any[]) {
    if (!ignore.includes(ev)) {
      args = args.map((arg, i, arr) => {
        if (arg instanceof EventEmitter) {
          return eventsToArray(arg, ignore, map)
        }
        return map(arg, i, arr)
      })
      array.push([ev, ...args])
    }
    return orig.call(this, ev, ...args)
  }

  return array
}
