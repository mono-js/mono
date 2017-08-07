export default class HttpError extends Error {
	public message: string
	public status: number
	public context: any

	constructor(message: string, status?: number, context?: any) {
		super(message)
		this.message = message
		this.status = status || 500
		this.context = context || {}

		Error.captureStackTrace(this, HttpError)
	}
}
