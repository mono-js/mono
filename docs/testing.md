# Testing

Mono is shipped with [mono-test-utils](https://github.com/terrajs/mono-test-utils), a powerful module to test your Mono API.

```js
const { start, stop, url, $get, $post, $put, $del } = require('mono-test-utils')
```

## Start Mono

This module lets your start & stop your Mono server in different environements easily:

```js
const { app, server, conf, stdout, stderr } = await start(dir, options = {})
```

`stdout` and `stderr` are array of strings, useful to check logs values.

## Stop Mono

To stop Mono, simply call `stop` and giving the `server` send back by `start()`.

```js
await stop(server)
```

## HTTP requests

Mono test utils gives mutliple methods to make HTTP requests to your Mono server:

```js
await $get(path, options = {})
await $post(path, options = {})
await $put(path, options = {})
await $del(path, options = {}) // alias: `$delete`
await $patch(path, options = {})
await $head(path, options = {})
await $options(path, options = {})
```

The `options` are the same as [request](https://github.com/request/request).

Every of the following methods return an object with these properties:

```js
{
  statusCode, // HTTP status code
  headers, // Headers sent back
  body, // Body of the response
  stdout, // Logs written on stdout during the request
  stderr // Logs written on stderr during the request
}
```

## Example

Example of `test/index.js` with [ava](https://github.com/avajs/ava):

```js
const test = require('ava')
const { join } = require('path')

const { start, stop, $get, $post } = require('mono-test-utils')

let ctx

// Start server
test.before('Start Mono app', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/example/'))
})

// Test API Endpoints
test('Call GET - /example', async (t) => {
	const { stdout, stderr, statusCode, body } = await $get('/example')
	t.true(stdout[0].includes('GET /example'))
	t.is(stderr.length, 0)
	t.is(statusCode, 200)
  // Imagine that GET - /example returns { hello: 'world' }
	t.deepEqual(body.body, { hello: 'world' })
})

test('Call POST - /example', async (t) => {
	const { statusCode, body } = await $post('/example', {
		body: { foo: 'bar' }
	})
	t.is(statusCode, 200)
})

// Close server
test.after('Close Mono server', async (t) => {
	await close(ctx.server)
})
```
