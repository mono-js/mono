const test = require('ava')
const { join } = require('path')

const { start, stop, $get, $post, $put } = require('mono-test-utils')
const monoPath = join(__dirname, '..')

let ctx

test('Start fixtures/routes/', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/routes'), { monoPath })
	const stdout = ctx.stdout.join('\n')
	const stderr = ctx.stderr.join('\n')
	t.true(ctx.routes.length > 0)
	t.true(stdout.includes('Adding routes from bad.routes.js'))
	t.true(stderr.includes('Module [bad.routes.js]: Route with index [0] must have a `path` defined'))
	t.true(stdout.includes('Adding routes from no.routes.js'))
	t.true(stderr.includes('Module [no.routes.js]: No valid exported routes (should be an array)'))
	t.true(stderr.includes('Module [bad.routes.js]: Route /no-method must have a valid `method` (get, post, put, delete, head, patch, all)'))
	t.true(stderr.includes('Module [bad.routes.js]: Route /bad-method must have a valid `method` (get, post, put, delete, head, patch, all)'))
	t.true(stderr.includes('Module [bad.routes.js]: Route GET - /bad-acl must use either "can" or "is", but not both'))
})

/*
** Multiple methods
*/
test('GET - /multiple-methods -> GET', async (t) => {
	const { statusCode, body } = await $get('/multiple-methods')
	t.is(statusCode, 200)
	t.is(body, 'GET')
})
test('POST - /multiple-methods -> POST', async (t) => {
	const { statusCode, body } = await $post('/multiple-methods')
	t.is(statusCode, 200)
	t.is(body, 'POST')
})
test('PUT - /multiple-methods -> 404', async (t) => {
	const { statusCode } = await $put('/multiple-methods')
	t.is(statusCode, 404)
})

/*
** Multiple handlers
*/
test('GET - /multiple-handlers -> ok', async (t) => {
	const { statusCode, body } = await $get('/multiple-handlers')
	t.is(statusCode, 200)
	t.is(body, 'ok')
})

/*
** Error thrown inside controller
*/
test('GET - /error-400 -> 400 custom-error', async (t) => {
	const { statusCode, body } = await $get('/error-400')
	t.is(statusCode, 400)
	t.is(body.code, 'custom-error')
	t.deepEqual(body.context, { hello: true })
})
test('GET - /error-500 -> 400 custom-error', async (t) => {
	const { statusCode, body } = await $get('/error-500')
	t.is(statusCode, 500)
	t.is(body.code, 'unspecified-error')
	t.deepEqual(body.context, {})
})

/*
** API Versioning
*/
test('GET - /version -> 404 not-found', async (t) => {
	const { statusCode, body } = await $get('/version')
	t.is(statusCode, 404)
	t.is(body.code, 'not-found')
	t.deepEqual(body.context, { url: '/version' })
})
test('GET - /v1/version -> 200', async (t) => {
	const { statusCode, body } = await $get('/v1/version')
	t.is(statusCode, 200)
	t.is(body, 'v1')
})
test('GET - /v1/multiple-versions -> 200', async (t) => {
	const { statusCode, body } = await $get('/v1/multiple-versions')
	t.is(statusCode, 200)
	t.is(body, 'v1')
})
test('GET - /v2/multiple-versions -> 200', async (t) => {
	const { statusCode, body } = await $get('/v2/multiple-versions')
	t.is(statusCode, 200)
	t.is(body, 'v2')
})
test('GET - /v3/multiple-versions -> 404', async (t) => {
	const { statusCode, body } = await $get('/v3/multiple-versions')
	t.is(statusCode, 404)
	t.is(body.code, 'not-found')
	t.deepEqual(body.context, { url: '/v3/multiple-versions' })
})

/*
** Route Validation
*/
test('GET - /validate -> 400', async (t) => {
	const { statusCode, body } = await $get('/validate')
	t.is(statusCode, 400)
	t.is(body.code, 'validation-error')
	t.is(body.context[0].field[0], 'email')
	t.is(body.context[0].location, 'query')
})
test('GET - /validate?email=team@terrajs.com -> 200', async (t) => {
	const { statusCode, body } = await $get('/validate?email=team@terrajs.com')
	t.is(statusCode, 200)
	t.is(body.valid, true)
})

// Close the server
test.after('Close the server', async () => {
	await stop(ctx.server)
})
