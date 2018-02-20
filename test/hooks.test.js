const test = require('ava')
const { join } = require('path')

const { start, stop, $get } = require('mono-test-utils')
const monoPath = join(__dirname, '..')

let ctx

test('Start fixtures/hooks/', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/hooks'), { monoPath })
	const stdout = ctx.stdout.join('\n')
	const stderr = ctx.stderr.join('\n')
	t.true(stdout.includes('Boot api-key module'))
	t.true(stdout.includes('Init hooks.init.js'))
	t.true(stdout.includes('Adding routes from hello.routes.js'))
	t.true(stderr.includes('Error on hook "ready"'))
	t.true(stderr.includes('Error: Hello'))
})

/*
** api-key module
*/
test('GET - /hello -> 200', async (t) => {
	const { statusCode, body } = await $get('/hello')
	t.is(statusCode, 200)
	t.is(body.hello, 'world')
})
test('GET - /secret -> 401 - api-key-required', async (t) => {
	const { statusCode, body } = await $get('/secret')
	t.is(statusCode, 401)
	t.is(body.code, 'api-key-required')
})
test('GET - /secret?apiKey=bad -> 401 - invalid-api-key', async (t) => {
	const { statusCode, body } = await $get('/secret?apiKey=bad')
	t.is(statusCode, 401)
	t.is(body.code, 'invalid-api-key')
})
test('GET - /secret?apiKey=secret -> 200', async (t) => {
	const { statusCode, body } = await $get('/secret?apiKey=secret')
	t.is(statusCode, 200)
	t.is(body.secret, 'world')
})
test('GET - /super-secret -> { found: "me" }', async (t) => {
	const { statusCode, body } = await $get('/super-secret')
	t.is(statusCode, 200)
	t.is(body.found, 'me')
})

// Close the server
test.after('Close the server', async () => {
	await stop(ctx.server)
})
