import t from 'tap'
import EE from 'node:events'
import { eventsToArray as etoa } from '../dist/cjs/index.js'

t.test('basic', function (t) {
  const emitter = new EE()
  const array = etoa(emitter, ['ignore', 'alsoignore'])

  emitter.emit('foo', 1, 2, 3)
  emitter.emit('ignore', 'should not see this')
  emitter.emit('bar', { x: 1 })

  // nested events get tracked as well
  const subemit = new EE()
  emitter.emit('sub', subemit)
  subemit.emit('childEvent', { some: 'data' })
  subemit.emit('alsoignore', 'should not see this')
  subemit.emit('anotherone', { some: 'data' }, 'many', 'args')

  // CAVEAT!
  emitter.emit('blaz', 'blorrg')
  subemit.emit('order', 'not', 'preserved between child and parent')

  // check out the array whenever
  t.same(array, [
    ['foo', 1, 2, 3],
    ['bar', { x: 1 }],
    [
      'sub',
      [
        ['childEvent', { some: 'data' }],
        ['anotherone', { some: 'data' }, 'many', 'args'],
        ['order', 'not', 'preserved between child and parent'],
      ],
    ],
    ['blaz', 'blorrg'],
  ])
  t.end()
})

t.test('ignore nothing', function (t) {
  const emitter = new EE()
  const array = etoa(emitter)
  emitter.emit('foo', 1, 2, 3)
  emitter.emit('ignore', 'should see this')
  emitter.emit('bar', { x: 1 })
  t.same(array, [
    ['foo', 1, 2, 3],
    ['ignore', 'should see this'],
    ['bar', { x: 1 }],
  ])

  t.end()
})

t.test('the map is not the territory', function (t) {
  const emitter = new EE()
  // cast all to strings
  const array = etoa(emitter, ['ignore'], function (arg) {
    return arg + ''
  })

  emitter.emit('foo', Buffer.from('hello'))
  const sub = new EE()
  emitter.emit('sub', sub)
  sub.emit('obj', {
    toString: function () {
      return 'toString fn'
    },
  })
  t.same(array, [
    ['foo', 'hello'],
    ['sub', [['obj', 'toString fn']]],
  ])
  t.end()
})
