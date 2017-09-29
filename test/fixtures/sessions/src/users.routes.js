module.exports = [
	{
		method: 'get',
		path: '/me',
		session: true,
		handler(req, res) {
			res.json(req.session)
		}
	}
]
