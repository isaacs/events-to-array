var test = require('tap').test
var EE = require('events')
var etoa = require('../etoa.js')

test('basic', function (t) {
  var emitter = new EE()
  var array = etoa(emitter)

  emitter.emit('foo', 1, 2, 3)
  emitter.emit('bar', { x: 1 })

  // nested events get tracked as well
  var subemit = new EE()
  emitter.emit('sub', subemit)
  subemit.emit('childEvent', { some: 'data' })
  subemit.emit('anotherone', { some: 'data' }, 'many', 'args')

  // CAVEAT!
  emitter.emit('blaz', 'blorrg')
  subemit.emit('order', 'not', 'preserved between child and parent')

  // check out the array whenever
  t.same(array,
  [ [ 'foo', 1, 2, 3 ],
    [ 'bar', { x: 1 } ],
    [ 'sub',
      [ [ 'childEvent', { some: 'data' } ],
        [ 'anotherone', { some: 'data' }, 'many', 'args' ],
        [ 'order', 'not', 'preserved between child and parent' ] ] ],
    [ 'blaz', 'blorrg' ] ])
  t.end()
})
