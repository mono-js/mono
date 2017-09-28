const test = require('ava')
const { join } = require('path')

const { start, stop } = require('@terrajs/mono-test-utils')
const monoPath = join(__dirname, '..')

test('Works with custom port', async (t) => {
	const { server, stdout } = await start(join(__dirname, 'fixtures/simple'), { monoPath })
	const out = stdout.join('\n')
	t.true(out.includes('Boot foo module'))
	t.true(out.includes('Init foo module'))
	t.true(out.includes('Init hello/hello.init.js'))
	t.true(out.includes('Init http.init.js'))
	t.true(out.includes('Adding routes from foo module'))
	t.true(out.includes('Adding routes from hello/hello.routes.js'))
	t.true(out.includes('Server running on'))
	// Close server
	await stop(server)
})
