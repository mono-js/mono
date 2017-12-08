const { HttpError } = require('../../../../../')

module.exports = ({ hook }) => {
	hook('onRequest', (route, req) => {
		// If this route does not have apiKey protection
		if (route.apiKey !== true) return
		// If not apiKey given
		if (!req.query.apiKey) {
			throw new HttpError('api-key-required', 401)
		}
		// Check apiKey value
		if (req.query.apiKey !== 'secret') {
			throw new HttpError('invalid-api-key', 401)
		}
	})
}
