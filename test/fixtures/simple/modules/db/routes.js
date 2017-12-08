const Joi = require('joi')
const { db } = require('./index')
const { jwt } = require('../../../../../')

const collection = db('users')
const UserValidation = Joi.object().keys({
	email: Joi.string().email().required(),
	password: Joi.string().min(6).required()
})

module.exports = [
	{
		method: 'POST',
		path: '/session',
		validation: { body: UserValidation },
		async handler(req, res) {
			const email = req.body.email.toLowerCase()
			const userFound = collection.list().find((user) => user.email === email && user.password === req.body.password)
			if (!userFound) throw new HttpError('invalid-credentials', 401)
			const token = await jwt.generateJWT({
				userId: userFound.id,
				admin: userFound.email === 'admin@terrajs.com'
			})
			const session = Object.assign({ token }, userFound)
			res.json(session)
		}
	},
	{
		method: 'GET',
		path: '/me',
		session: true,
		can: [],
		handler(req, res) {
			res.json(collection.get(req.session.userId))
		}
	},
	{
		method: 'GET',
		path: '/users',
		is: 'admin',
		handler(req, res) {
			res.json(collection.list())
		}
	},
	{
		method: 'GET',
		path: '/users/:id',
		can: { action: 'seeUser', user: ':id' },
		handler(req, res) {
			const user = collection.get(req.params.id)
			res.json(user)
		}
	},
	{
		method: 'POST',
		path: '/users',
		is: [],
		validation: { body: UserValidation },
		handler(req, res) {
			req.body.email = req.body.email.toLowerCase()
			// Check if email does not exists already
			const userFound = collection.list().find((user) => user.email === req.body.email)
			if (userFound) throw new HttpError('email-already-taken')
			const user = collection.save(req.body)
			res.json(user)
		}
	},
	{
		method: 'get',
		path: '/doc',
		handler(req, res) {
			const { routes } = require('../../../../../')
			res.json(routes)
		}
	}
]
