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
	const output = stdMock.flush()
	t.true(output.stdout.join(',').includes('Listening on port 8000'))
	// Close server
	await closeServer(server)
})
