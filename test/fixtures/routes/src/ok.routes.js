const Joi = require('joi')

module.exports = [
	{
		method: ['get', 'post'],
		path: '/multiple-methods',
		handler(req, res) {
			res.send(req.method)
		}
	},
	{
		method: 'get',
		path: '/multiple-handlers',
		handler: [
			(req, res, next) => {
				req.test = 'ok'
				next()
			},
			(req, res) => res.send(req.test)
		]
	},
	{
		method: 'get',
		path: '/error-400',
		handler() {
			throw new HttpError('custom-error', 400, { hello: true })
		}
	},
	{
		method: 'get',
		path: '/error-500',
		handler() {
			throw new HttpError()
		}
	},
	{
		version: 'v1',
		method: 'get',
		path: '/version',
		handler(req, res) {
			res.send(req.params.version)
		}
	},
	{
		version: ['v1', 'v2'],
		method: 'get',
		path: '/multiple-versions',
		handler(req, res) {
			res.send(req.params.version)
		}
	},
	{
		method: 'get',
		path: '/validate',
		validation: {
			headers: Joi.object(),
			cookies: Joi.object(),
			params: Joi.object(),
			query: Joi.object().keys({
				email: Joi.string().email().required()
			}),
			body: Joi.object()
		},
		handler(req, res) {
			res.json({ valid: true })
		}
	}
]
