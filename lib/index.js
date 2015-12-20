'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

require('babel/polyfill');

var path = require('path');

var select = require('cssauron-falafel');
var concat = require('concat-stream');
var duplex = require('duplexify');
var through = require('through2');
var falafel = require('falafel');

var CWD = process.cwd();

module.exports = namespaceify;

function namespaceify(file) {
  var _ref = arguments[1] === undefined ? {} : arguments[1];

  var _ref$dir = _ref.dir;
  var dir = _ref$dir === undefined ? CWD : _ref$dir;
  var _ref$aliases = _ref.aliases;
  var aliases = _ref$aliases === undefined ? ['require'] : _ref$aliases;
  var _ref$extensions = _ref.extensions;
  var extensions = _ref$extensions === undefined ? ['js'] : _ref$extensions;
  var namespaces = _ref.namespaces;

  var output = through();

  if (!extensions.includes(path.extname(file).slice(1))) {
    return output;
  }

  var aliasSelectors = aliases.map(toSelector);
  var names = Object.keys(namespaces);

  return duplex(concat({ encoding: 'string' }, parseFile), output);

  function parseFile(data) {
    output.push(falafel(data, parseNode).toString());
    output.push(null);
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

    var _node$source = node.source();

    var _node$source2 = _slicedToArray(_node$source, 1);

    var quote = _node$source2[0];

    node.update('' + quote + makeAlias() + quote);

    function makeAlias() {
      var relativeRequire = path.relative(path.dirname(file), aliased);

      if (!relativeRequire.startsWith('.')) {
        relativeRequire = '.' + relativeRequire;
      }

      return reqString.replace(alias, relativeRequire);
    }
  }

  function getAlias(str) {
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = names[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _name = _step.value;

        if (str.startsWith(_name + '/')) {
          return [_name, path.resolve(dir, namespaces[_name])];
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator['return']) {
          _iterator['return']();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return [];
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