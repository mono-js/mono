const Joi = require('joi')

module.exports = [
	{
		method: ['GET', 'post'],
		path: '/hello',
		can: { action: 'seeUser', user: ':userId' },
		handler(req, res) {
			res.json({ hello: 'world' })
		}
	},
	{
		method: 'get',
		path: '/hello-validation',
		validation: {
			query: Joi.object().keys({
				test: Joi.string().equal('test').required()
			})
		},
		handler(req, res) {
			res.json({ hello: true })
		}
	},
	{
		method: 'get',
		path: '/hello-error',
		handler() {
			throw new HttpError('hello-error')
		}
	},
	{
		method: 'get',
		path: '/hello-dev-test',
		env: ['development', 'test'],
		handler(req, res) {
			res.json({ hello: true })
		}
	},
	{
		method: 'get',
		path: '/hello-production',
		env: 'production',
		handler(req, res) {
			res.json({ production: true })
		}
	}
]
