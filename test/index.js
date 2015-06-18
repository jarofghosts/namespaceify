const test = require('tape')

const namespace = require('../lib')

test('transforms requires', t => {
  t.plan(1)

  const options = {namespaces: {'cats': './lib/utils'}, dir: '/projects/herp'}

  const namespaceStream = namespace(
      '/projects/herp/lib/modules/derp.js'
    , options
  )

  namespaceStream.on('data', data => {
    t.equal(data.toString(), 'require("../utils/lol")')
  })

  namespaceStream.end('require("cats/lol")')
})

test('transforms requires', t => {
  t.plan(1)

  const options = {namespaces: {'cats': './utils'}, dir: '/projects/herp'}

  const namespaceStream = namespace(
      '/projects/herp/lib/modules/derp.js'
    , options
  )

  namespaceStream.on('data', data => {
    t.equal(data.toString(), 'require("../../utils/lol")')
  })

  namespaceStream.end('require("cats/lol")')
})

test('respects quote type', t => {
  t.plan(1)

  const options = {namespaces: {'cats': './utils'}, dir: '/projects/herp'}

  const namespaceStream = namespace(
      '/projects/herp/lib/modules/derp.js'
    , options
  )

  namespaceStream.on('data', data => {
    t.equal(data.toString(), "require('../../utils/lol')")
  })

  namespaceStream.end("require('cats/lol')")
})

test('multiple aliases work', t => {
  t.plan(1)

  const options = {
      namespaces: {
          'cats': './utils'
        , 'dogs': './lol/whocares'
        , 'frogs': './lib/hoodoos'
      }
    , dir: '/projects/herp'
    , aliases: ['proxyquire', 'require', 'rooquire']
  }

  const original = `
  proxyquire('cats/meow')
  require('frogs/ribbit')
  proxyquire('../dogs/woof')
  rooquire('dogs/bark')
  `

  const expected = `
  proxyquire('../../utils/meow')
  require('../hoodoos/ribbit')
  proxyquire('../dogs/woof')
  rooquire('../../lol/whocares/bark')
  `

  const namespaceStream = namespace(
      '/projects/herp/lib/modules/derp.js'
    , options
  )

  namespaceStream.on('data', data => {
    t.equal(data.toString(), expected)
  })

  namespaceStream.end(original)
})

test('can specify aliases', t => {
  t.plan(1)

  const options = {
      namespaces: {
          'cats': './utils'
        , 'dogs': './lol/whocares'
        , 'frogs': './lib/hoodoos'
      }
    , dir: '/projects/herp'
    , aliases: ['proxyquire']
  }

  const original = `
  proxyquire('cats/meow')
  proxyquire('frogs/ribbit')
  proxyquire('../dogs/woof')
  proxyquire('dogs/bark')
  `

  const expected = `
  proxyquire('../../utils/meow')
  proxyquire('../hoodoos/ribbit')
  proxyquire('../dogs/woof')
  proxyquire('../../lol/whocares/bark')
  `

  const namespaceStream = namespace(
      '/projects/herp/lib/modules/derp.js'
    , options
  )

  namespaceStream.on('data', data => {
    t.equal(data.toString(), expected)
  })

  namespaceStream.end(original)
})

test('can do multiple', t => {
  t.plan(1)

  const options = {
      namespaces: {
          'cats': './utils'
        , 'dogs': './lol/whocares'
        , 'frogs': './lib/hoodoos'
      }
    , dir: '/projects/herp'
  }

  const original = `
  require('cats/meow')
  require('frogs/ribbit')
  require('../dogs/woof')
  require('dogs/bark')
  `

  const expected = `
  require('../../utils/meow')
  require('../hoodoos/ribbit')
  require('../dogs/woof')
  require('../../lol/whocares/bark')
  `

  const namespaceStream = namespace(
      '/projects/herp/lib/modules/derp.js'
    , options
  )

  namespaceStream.on('data', data => {
    t.equal(data.toString(), expected)
  })

  namespaceStream.end(original)
})

test('ignores non-js files if not configured otherwise', t => {
  t.plan(1)

  const options = {namespaces: {'cats': './utils'}, dir: '/projects/herp'}

  const namespaceStream = namespace(
      '/projects/herp/lib/modules/derp.hs'
    , options
  )

  namespaceStream.on('data', data => {
    t.equal(data.toString(), 'require("cats/lol")')
  })

  namespaceStream.end('require("cats/lol")')
})

test('can specify extensions to parse', t => {
  t.plan(1)

  const options = {
      namespaces: {'cats': './utils'}
    , dir: '/projects/herp'
    , extensions: ['hs']
  }

  const namespaceStream = namespace(
      '/projects/herp/lib/modules/derp.hs'
    , options
  )

  namespaceStream.on('data', data => {
    t.equal(data.toString(), 'require("../../utils/lol")')
  })

  namespaceStream.end('require("cats/lol")')
})
