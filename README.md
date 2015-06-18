# namespaceify

Browserify transform to namespace local directories for cleaner requires

## usage

Use it as a browserify transform and give it a list of namespaces to transform
into local requires!

```js
"transform": [
    ["namespaceify", {"namespaces": {"components": "./lib/components"}}]
]
```

### options

* `namespaces` (required) an object mapping "module names" to local directories.
* `aliases` (optional) an array specifying aliases for `require` to also
  transform, defaults to `['require']`.
* `extensions` (optional) an array specifying extensions to parse, defaults to
  `['js']`.
* `dir` (optional) a directory to consider the "root", defaults to CWD

### example

consider the above example mapping "components" to "./lib/components". this
allows you to turn:

```js
// lib/pages/reports/user-reports.js
const calendarComponent = require('../../components/calendar')
```

...into:

```js
const calendarComponent = require('components/calendar')
```

much cleaner! and far more portable!

## alternatives

if namespaceify doesn't tickle your fancy, or you just simply don't need all of
the flexibility it provides, here are some other great options for doing
something similar:

* [pkgify](http://npm.im/pkgify)
* [remapify](http://npm.im/remapify)
* [aliasify](http://npm.im/aliasify)

## license

MIT
