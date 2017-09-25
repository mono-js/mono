const { EventEmitter } = require('events')

const bcrypt = require('bcrypt')

/*
** ok(promise: Promise): <Promise>
*/
exports.ok = async function(promise) {
	try {
		return await promise
	} catch (err) {
		return
	}
}

/*
** cb(fn: Function, args: ...any): <Promise>
*/
exports.cb = function (fn, ...args) {
	return new Promise((resolve, reject) => {
		fn(...args, (err, result) => {
			if (err) return reject(err)
			resolve(result)
		})
	})
}

/*
** waitFor(ms)
*/
exports.waitFor = function(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms || 0))
}

/*
** waitForEvent(emmiter, eventName)
*/
exports.waitForEvent = function(emmiter, eventName) {
	return new Promise((resolve, reject) => {
		emmiter.once(eventName, (...args) => resolve([...args]))
	})
}

/*
** asyncObject(obj): Promise<Object>
*/
exports.asyncObject = async function(obj = {}) {
	const containsPromise = (key) => obj[key] && typeof obj[key].then === 'function'
	const keys = Object.keys(obj).filter(containsPromise)
	const promises = keys.map((key) => obj[key])
	const results = await Promise.all(promises)
	const container = Object.assign({}, obj)
	results.forEach((result, index) => {
		const key = keys[index]
		container[key] = result
	})
	return container
}

/*
** hashPassword(password, saltRounds = 10): Promise<string>
*/
exports.hashPassword = async function(password, saltRounds) {
	saltRounds = (typeof saltRounds === 'undefined' ? 10 : saltRounds)
	const salt = await bcrypt.genSalt(saltRounds)

	return bcrypt.hash(password, salt)
}

/*
** hashPassword(password): Promise<boolean>
*/
exports.verifyPassword = function(password, candidate) {
	return bcrypt.compare(candidate, password)
}
