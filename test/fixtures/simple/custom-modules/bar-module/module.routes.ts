module.exports = [
	{
		method: 'GET',
		path: '/bar',
		handler(req, res) {
			res.json({ bar: 'foo' })
		}
	}
]
