const test = require('ava')
const { join } = require('path')

const { start, stop } = require('mono-test-utils')
const monoPath = join(__dirname, '..')
const app = require('../package.json')

test('Check conf with NODE_ENV=test', async (t) => {
	const { conf, server } = await start(join(__dirname, 'fixtures/conf'), { monoPath })

	t.is(conf.env, 'test')
	t.is(conf.name, app.name)
	t.is(conf.version, app.version)
	t.deepEqual(conf.mono.modules, [])
	t.deepEqual(conf.mono.log, {
		console: true,
		files: [],
		http: [],
		transports: []
	})
	t.deepEqual(conf.mono.http, {
		port: 8000,
		logLevel: 'dev',
		host: 'localhost',
		bodyParser: {}
	})
	t.deepEqual(conf.mono.jwt, {
		headerKey: 'Authorization',
		secret: 'secret',
		options: {
			expiresIn: '7d'
		}
	})
	t.is(conf.test, true)

	// Stop server
	await stop(server)
})

test('Check conf with NODE_ENV=development', async (t) => {
	const { conf, server } = await start(join(__dirname, 'fixtures/conf'), { env: 'development', monoPath })

	t.is(conf.env, 'development')
	t.is(conf.test, false)

	// Stop server
	await stop(server)
})

test('Check conf with custom MONO_CONF_PATH', async (t) => {
	process.env.MONO_CONF_PATH = join(__dirname, 'fixtures/conf/conf-advanced')
	const { conf, server } = await start(join(__dirname, 'fixtures/conf'), { monoPath })

	t.is(conf.env, 'test')
	t.deepEqual(conf.arr, ['a', 'b'])
	t.deepEqual(conf.array, [1, 2, 3])
	t.deepEqual(conf.object, {
		key1: 'string',
		key2: 23
	})
	t.is(String(conf.regexp), '/test-2/')
	t.is(conf.other, 'yes')

	delete process.env.MONO_CONF_PATH
	// Stop server
	await stop(server)
})

test('Check conf with modules', async (t) => {
	process.env.MONO_CONF_PATH = join(__dirname, 'fixtures/conf/conf-modules')
	const { conf, server } = await start(join(__dirname, 'fixtures/conf'), { monoPath })

	t.deepEqual(conf.mono.modules[0], {
		name: 'node-module',
		path: join(__dirname, '../node_modules/node-module/')
	})
	t.deepEqual(conf.mono.modules[1], {
		name: 'relative-path',
		path: join(__dirname, './fixtures/conf/relative-path/')
	})
	t.deepEqual(conf.mono.modules[2], {
		name: 'mono-test-utils',
		path: join(__dirname, '../node_modules/mono-test-utils/lib')
	})
	t.deepEqual(conf.mono.modules[3], {
		name: 'awesome-module',
		path: join(__dirname, './fixtures/conf/conf-modules/main-module/')
	})
	t.deepEqual(conf.mono.modules[4], {
		name: 'terrajs',
		path: join(__dirname, './fixtures/conf/conf-modules/no-main-module/')
	})

	delete process.env.MONO_CONF_PATH
	// Stop server
	await stop(server)
})
