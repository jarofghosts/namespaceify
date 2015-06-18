const path = require('path')

const select = require('cssauron-falafel')
    , concat = require('concat-stream')
    , duplex = require('duplexify')
    , through = require('through2')
    , falafel = require('falafel')

const CWD = process.cwd()

module.exports = namespaceify

function namespaceify(file, {dir = CWD, aliases = ['require'], extensions = ['js'], namespaces}) {
  const output = through()

  if(extensions.indexOf(path.extname(file).slice(1)) === -1) {
    return output
  }

  const aliasSelectors = aliases.map(toSelector)
      , names = Object.keys(namespaces)

  return duplex(concat({encoding: 'string'}, parseFile), output)

  function parseFile(data) {
    output.push(falafel(data, parseNode).toString())
  }

  function parseNode(node) {
    const reqString = getRequire(node)

    if(!reqString || reqString.startsWith('.')) {
      return
    }

    const [alias, aliased] = getAlias(reqString)

    if(!aliased) {
      return
    }

    const quote = node.source()[0]

    node.update(`${quote}${makeAlias()}${quote}`)

    function makeAlias() {
      return reqString.replace(
          alias
        , path.relative(path.dirname(file), aliased)
      )
    }
  }

  function getAlias(str) {
    for(let i = 0; i < names.length; ++i) {
      let name = names[i]

      if(str.startsWith(`${name}/`)) {
        return [name, path.resolve(dir, namespaces[name])]
      }
    }
  }

  function getRequire(node) {
    let required

    for(let i = 0; i < aliasSelectors.length; ++i) {
      required = aliasSelectors[i](node)

      if(required) {
        return required.value
      }
    }
  }
}

function toSelector(word) {
  return select(`call > id[name=${word}]:first-child + literal`)
}
