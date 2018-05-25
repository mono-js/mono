const debug = require('debug')('mono:jwt')
const jsonwebtoken = require('jsonwebtoken')
const { cb } = require('mono-utils')

const HttpError = require('./http-error')

async function generateJWT(session) {
	if (!session) {
		throw new HttpError('session-is-empty', 400)
	}
	if (!session.userId) {
		throw new HttpError('session-has-no-userId', 400)
	}
	return await cb(jsonwebtoken.sign, session, this.jwt.secret, this.jwt.options)
}

/*
** Load the session into req.session
*/
async function loadSession(req, getJWT) {
	const headerKey = this.jwt.headerKey.toLowerCase()

	// Get token
	let token
	if (typeof getJWT === 'function') {
		token = getJWT(req)
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

module.exports = function (jwt) {
	// Set default options
	jwt.headerKey = jwt.headerKey || 'Authorization'
	jwt.secret = jwt.secret || 'secret'
	jwt.options = jwt.options || {}
	jwt.options.expiresIn = jwt.options.expiresIn || '7d'
	debug(`JWT header key: ${jwt.headerKey}`)
	debug(`JWT duration: ${jwt.options.expiresIn}`)

	// Bind jwt methods with options
	module.exports.jwt.generateJWT = generateJWT.bind({ jwt })
	module.exports.jwt.loadSession = loadSession.bind({ jwt })
}

module.exports.jwt = {
	generateJWT,
	loadSession
}
