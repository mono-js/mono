const debug = require('debug')('mono:hooks')
const { asyncForEach } = require('mono-utils')

const HttpError = require('./http-error')


class Hooks {

	constructor(log) {
		this.hooks = {}
		this.log = log

		this.hook = this.hook.bind(this)
	}

	hook(name, fn) {
		if (!name || typeof fn !== 'function') {
			return
		}
		this.hooks[name] = this.hooks[name] || []
		this.hooks[name].push(fn)
	}

	async callHook(name, ...args) {
		if (!this.hooks[name]) return
		debug(`Call ${name} hooks (${this.hooks[name].length})`)
		try {
			await asyncForEach(this.hooks[name], (fn) => fn(...args))
		} catch (err) {
			// If onRequest hook and HttpError, let the middleware render the error
			if (name === 'onRequest' && err instanceof HttpError) {
				throw err
			}
			this.log.error(`Error on hook "${name}"`)
			this.log.error(err)
		}
	}
}

module.exports = Hooks
