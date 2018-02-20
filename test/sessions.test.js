const test = require('ava')
const { join } = require('path')

const { start, stop, $get } = require('mono-test-utils')
const monoPath = join(__dirname, '..')

let ctx

test('Start fixtures/sessions/', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/sessions/'), { monoPath })
	const stdout = ctx.stdout.join('\n')
	const stderr = ctx.stderr.join('\n')
	t.true(stdout.includes('ACL loaded from users.acl.js'))
	t.true(stdout.includes('Adding routes from users.routes.js'))
	t.is(stderr.length, 0)
})

/*
** Route with session: true
*/
test('GET - /me (session: true) -> 401', async (t) => {
	const { statusCode, body } = await $get('/me')
	t.is(statusCode, 401)
	t.is(body.code, 'credentials-required')
})

test('GET - /lazy-me (session: optional) -> 200', async (t) => {
	const { statusCode, body } = await $get('/lazy-me')
	t.is(statusCode, 200)
	t.deepEqual(body, { connected: false })
})

// Close the server
test.after('Close the server', async () => {
	await stop(ctx.server)
})
