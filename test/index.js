const test = require('ava')
const { join } = require('path')
const stdMock = require('std-mocks')
const rp = require('request-promise-native')
const mono = require('..')

const closeServer = (server) => {
	return new Promise((resolve) => {
		server.close(resolve)
	})
}

test('Works with custom port', async (t) => {
	stdMock.use()
	const { server } = await mono(join(__dirname, 'fixtures/simple'))
	stdMock.restore()
	let { stdout } = stdMock.flush()
	stdout = stdout.join(',')
	t.true(stdout.includes('Boot foo module'))
	t.true(stdout.includes('Init foo module'))
	t.true(stdout.includes('Init hello/hello.init.js'))
	t.true(stdout.includes('Init http.init.js'))
	t.true(stdout.includes('Adding routes from foo module'))
	t.true(stdout.includes('Adding routes from hello/hello.routes.js'))
	t.true(stdout.includes('Server running on'))
	// Close server
	await closeServer(server)
})
