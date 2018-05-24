# Utils

We created some utils to enhance your development with Mono:

> We recommend to install the package, even if it's a dependency of Mono so you will have the last version of our utils.

```bash
npm install --save mono-utils
```

Then you can import them like this:

```js
const utils = require('mono-utils')
// Or
const { ok, cb, waitFor, ... } = require('mono-utils')
```

## ok

Waits for the value of the `Promise` and returns its value. If the promise throws an `Error`, returns `undefined`.

```js
ok(promise: Object): Promise
```

Example:

```js
const { ok } = require('mono-core/utils')
const { readFile } = require('fs-extra')

// readFile sends back a Promise since we use fs-extra
const file = await ok(readFile('./my-file.txt', 'utf-8'))

if (file) console.log('File found:', file)
```

## cb

Calls a function Node style function as first argument `function (err, result)`, all the others arguments will be given to the function. Waits for the callback result, throws an `Error` if `err` is truthy.

```js
cb(fn: Function, ...args: any[]): Promise
```

Example:

```js
const { ok } = require('mono-core/utils')
const fs = require('fs')

try {
  const file = await cb(fs.readFile, '/path/to/my/file.txt', 'utf-8')
} catch (err) {
  // Could not read file
}
```

## waitFor

Waits for `ms` milliseconds to pass, use `setTimeout` under the hood.

```js
waitFor(ms: number): Promise
```

Example:

```js
const { waitFor } = require('mono-core/utils')

await waitFor(1000) // wait for 1s
```

## waitForEvent

Waits for emitter to emit an eventName event.

```js
waitForEvent(emitter: EventEmitter, eventName: string, timeout: number = -1): Promise<Array>
```

Example:

```js
const { waitFor } = require('mono-core/utils')

await waitForEvent(sever, 'listen')
```

## asyncObject

Waits for all Promises in the keys of obj to resolve.

```js
asyncObject(obj: Object): Promise<Object>
```

Example:

```js
const { asyncObject } = require('mono-core/utils')

const { pictures, comments, tweets } = await asyncObject({
  pictures: getPictures(),
  comments: getComments(),
  tweets: getTweets()
})

console.log(pictures, comments, tweets)
```

## asyncMap

Waits for all Promises mapped by `fn`:

```js
asyncMap(array: Array, fn: Function): Promise<Array>
```

Example:

```js
const { asyncMap } = require('mono-core/utils')

const posts = await asyncMap([1, 2, 3], (id) => fetchPost(id))
```

## asyncForEach

Loop for every item in array and call `fn` and wait for it to finish **in series**:

```js
asyncForEach(array: Array, fn: Function): Promise<void>
```

Example:

```js
const { asyncMap } = require('mono-core/utils')

const posts = await asyncForEach(users, async (user) => {
  await saveUser(user)
})
```

## Other utils

We developed other utils that you might find useful:

- [mongodb-utils](https://github.com/mono-js/mongodb-utils)
- [elasticsearch-utils](https://github.com/mono-js/elasticsearch-utils)
- [mono-test-utils](https://github.com/mono-js/mono-test-utils)
