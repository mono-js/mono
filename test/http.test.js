const test = require('ava')
const ip = require('ip')
const { join } = require('path')

const { start, stop, $get, $post } = require('mono-test-utils')
const monoPath = join(__dirname, '..')

let ctx
const ipAddress = ip.address()

/*
** preventListen
*/
test('[env=prevent-listen] Start the server on port 80 -> fail', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath, env: 'prevent-listen' })
	const stdout = ctx.stdout.join('\n')

	t.true(stdout.includes('Environment: prevent-listen'))
	t.true(stdout.includes('Loading conf/application.js'))
	t.true(stdout.includes('Loading conf/prevent-listen.js'))
	t.true(stdout.includes('Startup duration'))
})

/*
** port & host
*/
test('[env=fail] Start the server on port 80 -> fail', async (t) => {
	const err = await t.throws(start(join(__dirname, 'fixtures/http'), { monoPath, env: 'fail' }))
	const stdout = err.stdout.join('\n')

	t.true(err instanceof Error)
	t.true(err.message.includes('Port 80 requires elevated privileges'))
	t.true(stdout.includes('Environment: fail'))
	t.true(stdout.includes('Loading conf/application.js'))
	t.true(stdout.includes('Loading conf/fail.js'))
})

test('Start the server on port 6666 -> ok', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath })
	const stdout = ctx.stdout.join('\n')

	t.true(stdout.includes('Environment: test'))
	t.true(stdout.includes('Loading conf/application.js'))
	t.true(stdout.includes('http://localhost:6666'))
})

test('Start a second server on port 6666 -> fail', async (t) => {
	const err =  await t.throws(start(join(__dirname, 'fixtures/http'), { monoPath }))
	const stdout = err.stdout.join('\n')

	t.true(err instanceof Error)
	t.true(err.message.includes('Port 6666 is already in use'))
	t.true(stdout.includes('Environment: test'))
	t.true(stdout.includes('Loading conf/application.js'))
})

test('Close server', async (t) => {
	await stop(ctx.server)
	t.pass()
})

test(`[env=host] Start the server on port 6667 & host ${ipAddress} -> ok`, async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath, env: 'host' })
	const stdout = ctx.stdout.join('\n')

	t.true(stdout.includes('Environment: host'))
	t.true(stdout.includes('Loading conf/application.js'))
	t.true(stdout.includes(`http://${ipAddress}:6667`))
	await stop(ctx.server)
})

/*
** logLevel
*/
test('[env=production] Start the server in production, logLevel=combined', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath, env: 'production' })

	t.is(ctx.conf.mono.http.logLevel, 'combined')
	t.true(ctx.stdout[0].includes('Environment: production'))
	t.true(ctx.stdout[1].includes('Loading conf/application.js'))

	const { stdout } = await $get('/_')

	t.true(stdout[0].includes('GET /_ HTTP/1.1" 200 61 "-" "-"'))
	await stop(ctx.server)
})

test('[env=log-level] Start the server with custom loglevel', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath, env: 'log-level' })
	const { stdout } = await $get('/_')

	t.true(stdout[0].includes('GET /_ 200'))
	await stop(ctx.server)
})

test('[env=no-log-level] Start the server with no loglevel', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath, env: 'no-log-level' })
	const { stdout } = await $get('/_')

	t.is(stdout.length, 0)
	await stop(ctx.server)
})

/*
** Helmet
*/
test('Start the server, check helmet header', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath })

	const { headers } = await $get('/_')

	t.is(headers['x-xss-protection'], '1; mode=block')
	t.falsy(headers['x-powered-by']) // Removed by Helmet
	await stop(ctx.server)
})

test('[env=no-helmet] Start the server, no helmet headers', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath, env: 'no-helmet' })

	const { headers } = await $get('/_')

	t.is(headers['x-powered-by'], 'Express')
	await stop(ctx.server)
})

test('[env=helmet] Start the server, helmet configued to keep x-powered-by', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath, env: 'helmet' })

	const { headers } = await $get('/_')

	t.is(headers['x-powered-by'], 'Express')
	await stop(ctx.server)
})

/*
** bodyParser
*/
test('Start the server, check bodyParser activated', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath })

	let body = (await $post('/json', {
		body: { json: 'works' }
	})).body
	t.deepEqual(body, { json: 'works' })

	await stop(ctx.server)
})

test('[env=no-body-parser] Start the server, no json parser', async (t) => {
	ctx = await start(join(__dirname, 'fixtures/http'), { monoPath, env: 'no-body-parser' })

	const { statusCode, body } = await $post('/json', {
		body: { json: 'works' }
	})

	t.is(statusCode, 200)
	t.falsy(body)
	await stop(ctx.server)
})
