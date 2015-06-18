'use strict';

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

var path = require('path');

var select = require('cssauron-falafel'),
    concat = require('concat-stream'),
    duplex = require('duplexify'),
    through = require('through2'),
    falafel = require('falafel');

var CWD = process.cwd();

module.exports = namespaceify;

function namespaceify(file, _ref) {
  var _ref$dir = _ref.dir;
  var dir = _ref$dir === undefined ? CWD : _ref$dir;
  var _ref$aliases = _ref.aliases;
  var aliases = _ref$aliases === undefined ? ['require'] : _ref$aliases;
  var _ref$extensions = _ref.extensions;
  var extensions = _ref$extensions === undefined ? ['js'] : _ref$extensions;
  var namespaces = _ref.namespaces;

  var output = through();

  if (extensions.indexOf(path.extname(file).slice(1)) === -1) {
    return output;
  }

  var aliasSelectors = aliases.map(toSelector),
      names = Object.keys(namespaces);

  return duplex(concat({ encoding: 'string' }, parseFile), output);

  function parseFile(data) {
    output.push(falafel(data, parseNode).toString());
  }

  function parseNode(node) {
    var reqString = getRequire(node);

    if (!reqString || reqString.startsWith('.')) {
      return;
    }

    var _getAlias = getAlias(reqString);

    var _getAlias2 = _slicedToArray(_getAlias, 2);

    var alias = _getAlias2[0];
    var aliased = _getAlias2[1];

    if (!aliased) {
      return;
    }

    var quote = node.source()[0];

    node.update('' + quote + '' + makeAlias() + '' + quote);

    function makeAlias() {
      return reqString.replace(alias, path.relative(path.dirname(file), aliased));
    }
  }

  function getAlias(str) {
    for (var i = 0; i < names.length; ++i) {
      var _name = names[i];

      if (str.startsWith('' + _name + '/')) {
        return [_name, path.resolve(dir, namespaces[_name])];
      }
    }
  }

  function getRequire(node) {
    var required = undefined;

    for (var i = 0; i < aliasSelectors.length; ++i) {
      required = aliasSelectors[i](node);

      if (required) {
        return required.value;
      }
    }
  }
}

function toSelector(word) {
  return select('call > id[name=' + word + ']:first-child + literal');
}