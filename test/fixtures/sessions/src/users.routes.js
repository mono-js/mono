module.exports = [
	{
		method: 'get',
		path: '/me',
		session: true,
		handler(req, res) {
			res.json(req.session)
		}
	},
	{
		method: 'get',
		path: '/lazy-me',
		session: 'optional',
		handler(req, res) {
			res.json(req.session || { connected: false })
		}
	}
]
