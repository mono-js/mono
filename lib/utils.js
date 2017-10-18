/*
** ok(promise: Promise): <Promise>
*/
exports.ok = async function (promise) {
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
exports.waitFor = function (ms) {
	return new Promise((resolve) => setTimeout(resolve, ms || 0))
}

/*
** waitForEvent(emmiter, eventName)
*/
exports.waitForEvent = function (emmiter, eventName, timeout = -1) {
	return new Promise((resolve, reject) => {
		let resolveCalled = false
		const r = (...args) => {
			if (resolveCalled) return
			resolve(...args)
			resolveCalled = true
		}
		emmiter.once(eventName, (...args) => r([...args]))
		if (timeout >= 0) setTimeout(() => reject('Timeout'), timeout)
	})
}

/*
** asyncObject(obj): Promise<Object>
*/
exports.asyncObject = async function (obj = {}) {
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
