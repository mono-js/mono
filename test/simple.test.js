const test = require('ava')
const { join } = require('path')

const { start, stop, $get } = require('mono-test-utils')
const monoPath = join(__dirname, '..')
const pkg = require('../package.json')

let ctx

test('Start the server and log whats happening', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/simple'), { monoPath })
	const stdout = ctx.stdout.join('\n')

	t.true(stdout.includes('Environment: test'))
	t.true(stdout.includes('Loading conf/application.js'))
	t.true(stdout.includes('Boot db module'))
	t.true(stdout.includes('Init db module'))
	t.true(stdout.includes('Init hello/hello.init.js'))
	t.true(stdout.includes('Init http.init.js'))
	t.true(stdout.includes('ACL loaded from db module'))
	t.true(stdout.includes('Adding routes from db module'))
	t.true(stdout.includes('Adding routes from hello/hello.routes.js'))
	t.true(stdout.includes('Server running on'))
})

test('GET /_ => mono-core', async (t) => {
	const { statusCode, body, stdout, stderr } = await $get('/_')

	t.is(statusCode, 200)
	t.deepEqual(body, {
		name: pkg.name,
		version: pkg.version,
		env: 'test'
	})
	t.is(stderr.length, 0)
	t.is(stdout.length, 1)
	t.true(stdout[0].includes('GET /_'))
})

test('GET /_ping => 200 OK', async (t) => {
	const { statusCode, body, stdout, stderr } = await $get('/_ping')

	t.is(statusCode, 200)
	t.is(body, 'OK')
	t.is(stderr.length, 0)
	t.is(stdout.length, 1)
	t.true(stdout[0].includes('GET /_ping'))
})

test('GET /404 => 404 status code', async (t) => {
	const { statusCode, body } = await $get('/404')

	t.is(statusCode, 404)
	t.is(body.code, 'not-found')
	t.is(body.context.url, '/404')
})

test('GET /hello-error => 500 status code', async (t) => {
	const { statusCode, body } = await $get('/hello-error')

	t.is(statusCode, 500)
	t.is(body.code, 'hello-error')
	t.deepEqual(body.context, {})
})

test('GET /hello-dev-test => 200 status code', async (t) => {
	const { statusCode, body } = await $get('/hello-dev-test')

	t.is(statusCode, 200)
	t.deepEqual(body, { hello: true })
})

test('GET /hello-production => 404 status code (env defined)', async (t) => {
	const { statusCode, body } = await $get('/hello-production')

	t.is(statusCode, 404)
	t.is(body.code, 'not-found')
})

test.after('Close the server', async () => {
	await stop(ctx.server)
})
