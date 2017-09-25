module.exports = [
	{
		method: 'GET',
		path: '/hello',
		handler(req, res) {
			res.json({ foo: 'bar' })
		}
	}
]
