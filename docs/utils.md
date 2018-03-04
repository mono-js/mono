# Utils

Mono is shipped with useful utils:

```js
const { utils } = require('@terrajs/mono')
// Or
const { ok, cb, waitFor, ... } = require('@terrajs/mono/utils')
```

## ok

Waits for the value of the `Promise` and returns its value. If the promise throws an `Error`, returns `undefined`.

```js
ok(promise: Object): Promise
```

## cb

Calls a function Node style function as first argument `function (err, result)`, all the others arguments will be given to the function. Waits for the callback result, throws an `Error` if `err` is truthy.

```js
cb(fn: Function, ...args: any[]): Promise
```

Example:

```js
const fs = require('fs')

try {
  const file = await cb(fs.readFile, '/path/to/my/file.txt', 'utf-8')
} catch (err) {
  // Could not ready file
}
```

## waitFor

Waits for `ms` milliseconds to pass, use `setTimeout` under the hood.

```js
waitFor(ms: number): Promise
```

## waitForEvent

Waits for emitter to emit an eventName event.

```js
waitForEvent(emitter: EventEmitter, eventName: string, timeout: number = -1): Promise<Array>
```

## asyncObject

Waits for all Promises in the keys of obj to resolve.

```js
asyncObject(obj: Object): Promise<Object>
```

## asyncMap

Waits for all Promises mapped by `fn`:

```js
asyncMap(array: Array, fn: Function): Promise<Array>
```

## asyncForEach

Loop for every item in array and call `fn` and wait for it to finish (in series):

```js
asyncForEach(array: Array, fn: Function): Promise<void>
```

## Other utils

We developed other utils that you might find useful:
- [mongodb-utils](https://github.com/terrajs/mongodb-utils)
- [elasticsearch-utils](https://github.com/terrajs/elasticsearch-utils)
- [mono-test-utils](https://github.com/terrajs/mono-test-utils)
