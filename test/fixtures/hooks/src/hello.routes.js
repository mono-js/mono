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
	}
]
