module.exports = [
	{
		method: 'POST',
		path: '/json',
		handler(req, res) {
			res.json(req.body)
		}
	}
]
