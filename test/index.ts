import test from 'ava'

import { join } from 'path'
import * as stdMock from 'std-mocks'
import * as rp from 'request-promise-native'

import mono from '../src'

const closeServer = (server) => {
	return new Promise((resolve) => {
		server.close(resolve)
	})
}

test('Works with custom port', async (t) => {
	stdMock.use()
	const { app, server } = await mono(join(__dirname, 'fixtures/simple'))
	stdMock.restore()
	const { stdout } = stdMock.flush()
	t.true(stdout.join(',').includes('Listening on port 8000'))
	t.true(stdout.join(',').includes('Init foo-module mono module'))
	t.true(stdout.join(',').includes('Init test project module'))
	t.true(stdout.join(',').includes('Init http project module'))
	// Close server
	await closeServer(server)
})
