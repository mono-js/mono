# Utils

Mono is shipped with useful utils:

```js
const { ok, cb, waitFor, ... } = require('@terrajs/mono/utils')
```

Waits for the value of promise. If promise throws an Error, returns undefined.

```js
ok(promise: Object): Promise
```

Calls a function fn that takes arguments args and an (err, result) callback. Waits for the callback result, throwing an Error if err is truthy.

```js
cb(fn: Function, ...args: any[]): Promise
```

Waits for `ms` milliseconds to pass, use `setTimeout` under the hood.

```js
waitFor(ms: number): Promise
```

Waits for emitter to emit an eventName event.

```js
waitForEvent(emitter: EventEmitter, eventName: string, timeout: number = -1): Promise<Array>
```

Waits for all Promises in the keys of obj to resolve.

```js
asyncObject(obj: Object): Promise<Object>
```

Waits for all Promises mapped by `fn`:

```js
asyncMap(array: Array, fn: Function): Promise<Array>
```

Loop for every item in array and call `fn` and wait for it to finish (in series):

```js
asyncForEach(array: Array, fn: Function): Promise<void>
```

We developed other utils that you might find useful:
- [mongodb-utils](https://github.com/terrajs/mongodb-utils)
- [elasticsearch-utils](https://github.com/terrajs/elasticsearch-utils)
- [mono-test-utils](https://github.com/terrajs/mono-test-utils)
