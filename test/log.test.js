const test = require('ava')
const { join } = require('path')
const { readFileSync } = require('fs')
const { waitFor } = require('../utils')

const { start, stop, stdMock, stdRestore, $get } = require('mono-test-utils')
const monoPath = join(__dirname, '..')

test('Start the server on port -> ok', async (t) => {
	const { server, log } = await start(join(__dirname, 'fixtures/log'), { monoPath })

	/*
	** Simple use case
	*/
	stdMock()
	log.verbose('Verbose message')
	log.debug('Debug message')
	log.info('Info message')
	log.warn('Warning message')
	log.error('Error message')
	let output = stdRestore()
	// Check that logs are written in the right std
	t.is(output.stdout.length, 4)
	t.is(output.stderr.length, 1)
	// Check order
	t.true(output.stdout[0].includes('[mono-core] Verbose message'))
	t.true(output.stdout[1].includes('[mono-core] Debug message'))
	t.true(output.stdout[2].includes('[mono-core] Info message'))
	t.true(output.stdout[3].includes('[mono-core] Warning message'))
	t.true(output.stderr[0].includes('[mono-core] Error message'))

	/*
	** Profiling
	*/
	stdMock()
	log.profile('foo')
	log.profile('foo')
	output = stdRestore()
	t.true(output.stdout[0].includes('[mono-core] foo durationMs='))

	/*
	** Simple use case with modules
	*/
	const l = log.module('ava')
	stdMock()
	l.verbose('Verbose message')
	l.debug('Debug message')
	l.info('Info message')
	l.warn('Warning message')
	l.error('Error message')
	output = stdRestore()
	// Check that logs are written in the right std
	t.is(output.stdout.length, 4)
	t.is(output.stderr.length, 1)
	// Check order
	t.true(output.stdout[0].includes('[mono-core:ava] Verbose message'))
	t.true(output.stdout[1].includes('[mono-core:ava] Debug message'))
	t.true(output.stdout[2].includes('[mono-core:ava] Info message'))
	t.true(output.stdout[3].includes('[mono-core:ava] Warning message'))
	t.true(output.stderr[0].includes('[mono-core:ava] Error message'))

	/*
	** Stream property
	*/
	stdMock()
	t.truthy(log.stream)
	t.is(typeof log.stream.write, 'function')
	log.stream.write('foo')
	output = stdRestore()
	t.true(output.stdout[0].includes('[mono-core] foo'))

	await stop(server)
})

test('[env=no-console] Start the server with no console logs', async (t) => {
	const { server, log } = await start(join(__dirname, 'fixtures/log'), { monoPath, env: 'no-console' })

	stdMock()
	log.verbose('Verbose message')
	log.debug('Debug message')
	log.info('Info message')
	log.warn('Warning message')
	log.error('Error message')
	const output = stdRestore()
	// Check that logs are not written in std
	t.is(output.stdout.length, 0)
	t.is(output.stderr.length, 0)

	await stop(server)
})

test('[env=file] Start the server with log files', async (t) => {
	const { server, log, conf } = await start(join(__dirname, 'fixtures/log'), { monoPath, env: 'file' })
	const path = conf.mono.log.files[0].filename

	log.verbose('Verbose message')
	log.debug('Debug message')
	log.info('Info message')
	log.warn('Warning message')
	log.error('Error message')

	await waitFor(1000)

	const output = await readFileSync(path, 'utf-8')
	const lines = output.split('\n').slice(3) // slip first 3 logs from mono
	t.is(lines.length, 6) // count last empty line
	// Check info log
	const traceLog = JSON.parse(lines[0])
	t.is(traceLog.level, 'verbose')
	t.is(traceLog.message, 'Verbose message')
	t.true(!!traceLog.timestamp)
	// Check info log
	const debugLog = JSON.parse(lines[1])
	t.is(debugLog.level, 'debug')
	t.is(debugLog.message, 'Debug message')
	t.true(!!debugLog.timestamp)
	// Check info log
	const infoLog = JSON.parse(lines[2])
	t.is(infoLog.level, 'info')
	t.is(infoLog.message, 'Info message')
	t.true(!!infoLog.timestamp)
	// Check warn log
	const warnLog = JSON.parse(lines[3])
	t.is(warnLog.level, 'warn')
	t.is(warnLog.message, 'Warning message')
	t.true(!!warnLog.timestamp)
	// Check error log
	const errorLog = JSON.parse(lines[4])
	t.is(errorLog.level, 'error')
	t.is(errorLog.message, 'Error message')
	t.true(!!errorLog.timestamp)

	await stop(server)
})

test('[env=http] Start the server with stream logs', async (t) => {
	const { server, log } = await start(join(__dirname, 'fixtures/log'), { monoPath, env: 'http' })

	log.verbose('Verbose message')

	await waitFor(100)
	const { body } = await $get('/logs')

	const vLog = body.find((log) => log.params.level === 'verbose')
	t.is(vLog.method, 'collect')
	t.is(vLog.params.level, 'verbose')
	t.is(vLog.params.message, 'Verbose message')

	await stop(server)
})

test('[env=logstash] Start the server with stream logs', async (t) => {
	const { server, log } = await start(join(__dirname, 'fixtures/log'), { monoPath, env: 'logstash' })

	log.info('Info message')
	await waitFor(100)
	await stop(server)
	t.pass()
})
