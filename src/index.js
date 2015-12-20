require('babel/polyfill')

const path = require('path')

const select = require('cssauron-falafel')
const concat = require('concat-stream')
const duplex = require('duplexify')
const through = require('through2')
const falafel = require('falafel')

const CWD = process.cwd()

module.exports = namespaceify

function namespaceify (file, {dir = CWD, aliases = ['require'], extensions = ['js'], namespaces} = {}) {
  const output = through()

  if (!extensions.includes(path.extname(file).slice(1))) {
    return output
  }

  const aliasSelectors = aliases.map(toSelector)
  const names = Object.keys(namespaces)

  return duplex(concat({encoding: 'string'}, parseFile), output)

  function parseFile (data) {
    output.push(falafel(data, parseNode).toString())
    output.push(null)
  }

  function parseNode (node) {
    const reqString = getRequire(node)

    if (!reqString || reqString.startsWith('.')) {
      return
    }

    const [alias, aliased] = getAlias(reqString)

    if (!aliased) {
      return
    }

    const [quote] = node.source()

    node.update(`${quote}${makeAlias()}${quote}`)

    function makeAlias () {
      let relativeRequire = path.relative(path.dirname(file), aliased)

      if (!relativeRequire.startsWith('.')) {
        relativeRequire = `.${relativeRequire}`
      }

      return reqString.replace(alias, relativeRequire)
    }
  }

  function getAlias (str) {
    for (let name of names) {
      if (str.startsWith(`${name}/`)) {
        return [name, path.resolve(dir, namespaces[name])]
      }
    }

    return []
  }

  function getRequire (node) {
    let required

    for (let i = 0; i < aliasSelectors.length; ++i) {
      required = aliasSelectors[i](node)

      if (required) {
        return required.value
      }
    }
  }
}

function toSelector (word) {
  return select(`call > id[name=${word}]:first-child + literal`)
}
