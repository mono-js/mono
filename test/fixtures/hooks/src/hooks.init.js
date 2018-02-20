module.exports = ({ hook }) => {
	// Should do nothing
	hook()
	hook('only-name')
	// Throw an error in the hook
	hook('ready', () => {
		throw new Error('Hello')
	})

	// Send response
	hook('onRequest', (route, req, res) => {
		if (req.url === '/super-secret') return res.json({ found: 'me' })
	})
}
