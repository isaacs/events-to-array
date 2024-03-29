# events-to-array

Put a bunch of emitted events in an array, for testing.

If any of the emitted arguments are event emitters, then they'll also
be tracked, and replaced in the array with their tracking array.
(This is less confusing in practice than it sounds in text, see
below.) The only caveat is that the events in the child event emitter
and in the parent are not preserved in order, so this lib doesn't tell
you whether the child events happened before or after any subsequent
parent events.

## USAGE

```js
import assert = from 'assert'
import EE = from 'events'
import { eventsToArray } from 'events-to-array'

const emitter = new EE()
const array = eventsToArray(emitter)

emitter.emit('foo', 1, 2, 3)
emitter.emit('bar', { x: 1 })

// nested events get tracked as well
const subemit = new EE()
emitter.emit('sub', subemit)
subemit.emit('childEvent', { some: 'data' })
subemit.emit('anotherone', { some: 'data' }, 'many', 'args')

// CAVEAT!  See above in the wordy part of this readme.
// Note that the blaz/blorrg event comes after the child, and there's
// no way to know that the child 'order not preserved' event happened
// after.
emitter.emit('blaz', 'blorrg')
subemit.emit('order', 'not', 'preserved between child and parent')

// check out the array whenever
assert.deepEqual(array,
[ [ 'foo', 1, 2, 3 ],
  [ 'bar', { x: 1 } ],
  [ 'sub',
    [ [ 'childEvent', { some: 'data' } ],
      [ 'anotherone', { some: 'data' }, 'many', 'args' ],
      [ 'order', 'not', 'preserved between child and parent' ] ] ],
  [ 'blaz', 'blorrg' ] ])
```

## `eventsToArray(emitter, [ignoreList], [mapFunction])`

Returns an array with all the events emitted by the emitter.

It's your responsibility to know when to check it for the events that
you expected to have received.

The `ignoreList` is an array of event names to ignore.

The `mapFunction` is a function that takes a list of arguments and
returns a potentially-mutated array of arguments. Note that child
event emitters will already have been swapped out for an
events-to-array list so that nested events are caught.

This is handy, for example, for swapping out large `Buffer` objects
with something like `{type: 'buffer', length: 123456}` rather than
blow up the JSON fixtures.

The map function is called on the args list as `map(arg, index, list)`
