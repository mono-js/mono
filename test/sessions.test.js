const test = require('ava')
const jsonwebtoken = require('jsonwebtoken')
const { join } = require('path')
const { start, stop, $get, $post } = require('mono-test-utils')

const { cb } = require('../utils')
const monoPath = join(__dirname, '..')

let ctx
let tCtx = {
	session: null,
	token: null
}

test('Start fixtures/sessions/', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/sessions/'), { monoPath })
	const stdout = ctx.stdout.join('\n')
	const stderr = ctx.stderr.join('\n')
	t.true(stdout.includes('ACL loaded from users.acl.js'))
	t.true(stdout.includes('Adding routes from users.routes.js'))
	t.is(stderr.length, 0)
})


test('POST /session-fail -> Fails with `session` empty', async (t) => {
	const { statusCode, body } = await $post('/session-fail')

	t.is(statusCode, 400)
	t.is(body.code, 'session-is-empty')
})
test('POST /session -> Fails with no `userId`', async (t) => {
	const session = { noUserId: true }
	const { statusCode, body } = await $post('/session', { body: session })

	t.is(statusCode, 400)
	t.is(body.code, 'session-has-no-userId')
})

test('POST /session -> Fails with no `userId`', async (t) => {
	tCtx.session = { userId: 1, name: 'Bruce Wayne' }
	const { statusCode, body } = await $post('/session', { body: tCtx.session })

	t.is(statusCode, 200)
	t.true(body.token.length > 100)
	tCtx.token = body.token
})

test('GET - /session with no header -> 401', async (t) => {
	const { statusCode, body } = await $get('/session')

	t.is(statusCode, 401)
	t.is(body.code, 'credentials-required')
})

test('GET - /session with bad header -> 401', async (t) => {
	const { statusCode, body } = await $get('/session', {
		headers: { Authorization: 'bad' }
	})

	t.is(statusCode, 401)
	t.is(body.code, 'credentials-bad-schema')
})

test('GET - /session with bad token -> 401', async (t) => {
	const { statusCode, body } = await $get('/session', {
		headers: { Authorization: 'Bearer bad' }
	})

	t.is(statusCode, 401)
	t.is(body.code, 'invalid-token')
})

test('GET - /session with good token but no userId -> 401', async (t) => {
	const badSession = { noUserId: true }
	const fakeToken = await cb(jsonwebtoken.sign, badSession, ctx.conf.mono.jwt.secret, ctx.conf.mono.jwt.options)
	const { statusCode, body } = await $get('/session', {
		headers: { Authorization: `Bearer ${fakeToken}` }
	})

	t.is(statusCode, 401)
	t.is(body.code, 'session-has-no-userId')
})

test('GET - /session with good token -> 200', async (t) => {
	const { statusCode, body } = await $get('/session', {
		headers: { Authorization: `Bearer ${tCtx.token}` }
	})

	t.is(statusCode, 200)
	t.is(body.userId, tCtx.session.userId)
	t.is(body.name, tCtx.session.name)
	t.is(typeof body.exp, 'number')
	t.is(typeof body.iat, 'number')
})

test('GET - /session/:token with good token (use getJWT()) -> 200', async (t) => {
	const { statusCode, body } = await $get(`/session/${tCtx.token}`)

	t.is(statusCode, 200)
	t.is(body.userId, tCtx.session.userId)
	t.is(body.name, tCtx.session.name)
	t.is(typeof body.exp, 'number')
	t.is(typeof body.iat, 'number')
})

test('GET - /session/:token with good token (and Bearer) (use getJWT()) -> 200', async (t) => {
	const { statusCode, body } = await $get(`/session/Bearer ${tCtx.token}`)

	t.is(statusCode, 200)
	t.is(body.userId, tCtx.session.userId)
	t.is(body.name, tCtx.session.name)
	t.is(typeof body.exp, 'number')
	t.is(typeof body.iat, 'number')
})


test('GET - /lazy-sesion (session: optional) -> 200', async (t) => {
	const { statusCode, body } = await $get('/lazy-session')

	t.is(statusCode, 200)
	t.deepEqual(body, { connected: false })
})

// Close the server
test.after('Close the server', async () => {
	await stop(ctx.server)
})
