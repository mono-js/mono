import * as jwt from 'jsonwebtoken'
import HttpError from './http-error'
import { cb } from './utils'

export namespace MonoJWT {
	export interface Options {
		headerKey?: string
		secret?: string
		expiresIn?: number | string
	}
}

async function generateJWT(req, session: any): Promise<string> {
	if (!session) {
		throw new HttpError('session-is-empty', 400)
	}
	if (!session.userId) {
		throw new HttpError('session-has-no-userId', 400)
	}
	return await cb(jwt.sign, session, this.jwt.secret, { expiresIn: this.jwt.expiresIn })
}

/*
** Load the session into req.session
*/
async function loadSession(req, getToken?: (req) => string): Promise<void> {
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
		session = await cb(jwt.verify, token, this.jwt.secret)
	} catch (err) {
		throw new HttpError('invalid-token', 401)
	}
	// Verify session.userId
	/* istanbul ignore if */
	if (!session.userId) {
		throw new HttpError('session-has-no-userId', 401)
	}
	req.session = session
}

function sanitizeToken(token: string) {
	token = token || ''
	if (token.split(' ')[0].toLowerCase() === 'bearer') {
		token = token.split(' ')[1]
	}
	return token
}

export default function (options: MonoJWT.Options, app) {
	options.headerKey = options.headerKey || 'Authorization'
	options.secret = options.secret || 'secret'
	options.expiresIn = options.expiresIn || '7d'
	// Add first middleware to add JWT support
	app.use((req, res, next) => {
		req.generateJWT = generateJWT.bind(options, req)
		req.loadSession = loadSession.bind(options, req)
		next()
	})
}
