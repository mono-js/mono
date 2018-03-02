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
	},
	{
		method: 'get',
		path: '/acl/bad',
		can: 'seeSomething',
		handler(req, res) {
			res.sendStatus(200)
		}
	},
	{
		method: 'get',
		path: '/acl/batman',
		can: { action: 'knowBatman', user: 'batman' },
		handler(req, res) {
			res.sendStatus(200)
		}
	},
	{
		method: 'get',
		path: '/acl/:userId',
		can: { action: 'knowBatman', user: ':userId' },
		handler(req, res) {
			res.sendStatus(200)
		}
	},
	{
		method: 'get',
		path: '/acl/:batman',
		can: { action: 'knowBatman', user: 'batman' },
		handler(req, res) {
			res.sendStatus(200)
		}
	}
]
