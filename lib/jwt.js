const debug = require('debug')('mono:jwt')
const jsonwebtoken = require('jsonwebtoken')

const HttpError = require('./http-error')
const { cb } = require('./utils')

async function generateJWT(session) {
	if (!session) {
		throw new HttpError('session-is-empty', 400)
	}
	if (!session.userId) {
		throw new HttpError('session-has-no-userId', 400)
	}
	return await cb(jsonwebtoken.sign, session, this.jwt.secret, { expiresIn: this.jwt.expiresIn })
}

/*
** Load the session into req.session
*/
async function loadSession(req, getToken) {
	const headerKey = this.jwt.headerKey.toLowerCase()

	// Get token
	let token
	if (typeof getToken === 'function') {
		token = getToken(req)
	} else if (req.headers && req.headers[headerKey]) {
		const parts = req.headers[headerKey].split(' ')
		if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
			token = parts[1]
		} else {
			throw new HttpError('credentials-bad-schema', 401, { message: `Format is ${headerKey}: Bearer [token]` })
		}
	}
	token = sanitizeToken(token)

	// if no token, answer directly
	if (!token) {
		throw new HttpError('credentials-required', 401)
	}

	// Verify token
	let session
	try {
		session = await cb(jsonwebtoken.verify, token, this.jwt.secret)
	} catch (err) {
		throw new HttpError('invalid-token', 401)
	}

	// Verify session.userId
	if (!session.userId) {
		throw new HttpError('session-has-no-userId', 401)
	}

	// Add session to req.session
	req.session = session
}

function sanitizeToken(token) {
	token = token || ''

	if (token.split(' ')[0].toLowerCase() === 'bearer') {
		token = token.split(' ')[1]
	}
	return token
}

module.exports = function (options) {
	// Set default options
	options.headerKey = options.headerKey || 'Authorization'
	options.secret = options.secret || 'secret'
	options.expiresIn = options.expiresIn || '7d'
	debug(`JWT header key: ${options.headerKey}`)
	debug(`JWT duration: ${options.expiresIn}`)

	// Bind jwt methods with options
	module.exports.jwt.generateJWT = generateJWT.bind({ jwt: options })
	module.exports.jwt.loadSession = loadSession.bind({ jwt: options })
}

module.exports.jwt = {
	generateJWT,
	loadSession
}
