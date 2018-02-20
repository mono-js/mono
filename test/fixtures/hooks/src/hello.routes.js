module.exports = [
	{
		method: 'get',
		path: '/hello',
		handler(req, res) {
			res.json({ hello: 'world' })
		}
	},
	{
		method: 'get',
		path: '/secret',
		apiKey: true,
		session: true, // Should not go inside since apiKey will run first and fill req.session
		handler(req, res) {
			res.json(req.session)
		}
	},
	{
		method: 'get',
		path: '/super-secret', // handled by hooks.init.js
		handler(req, res) {
			res.json({ secret: 'world' })
		}
	}
]
