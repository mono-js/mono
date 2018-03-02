const { jwt } = require('../../../../')

module.exports = [
	{
		method: 'post',
		path: '/session-fail',
		async handler(req, res) {
			res.json({
				token: await jwt.generateJWT()
			})
		}
	},
	{
		method: ['POST', 'put'],
		path: '/session',
		async handler(req, res) {
			res.json({
				token: await jwt.generateJWT(req.body)
			})
		}
	},
	{
		method: 'get',
		path: '/session',
		session: true,
		handler(req, res) {
			res.json(req.session)
		}
	},
	{
		method: 'get',
		path: '/lazy-session',
		session: 'optional',
		handler(req, res) {
			res.json(req.session || { connected: false })
		}
	},
	{
		method: 'get',
		path: '/session/:token',
		session: true,
		getJWT: (req) => req.params.token,
		handler(req, res) {
			res.json(req.session)
		}
	},
]
