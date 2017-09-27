class HttpError extends Error {
	constructor(message, status, context) {
		super(message)
		this.message = message
		this.status = status || 500
		this.context = context || {}

		Error.captureStackTrace(this, HttpError)
	}
}

module.exports = HttpError
