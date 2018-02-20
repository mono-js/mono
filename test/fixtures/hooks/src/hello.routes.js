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
		handler(req, res) {
			res.json({ secret: 'world' })
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
