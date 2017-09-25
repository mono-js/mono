const { HttpError } = require('../../../../../')

module.exports = [
	{
		method: 'GET',
		path: '/hello',
		handler(req, res) {
			res.json({ foo: 'bar' })
		}
	},
	{
		method: 'get',
		path: '/hello-error',
		handler() {
			throw new HttpError('hello-error')
		}
	}
]
