const logs = []

module.exports = [
	{
		method: 'POST',
		path: '/log',
		handler(req, res) {
			logs.push(req.body)

			res.sendStatus(200)
		}
	},
	{
		method: 'GET',
		path: '/logs',
		handler(req, res) {
			res.json(logs)
		}
	}
]
