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
		emmiter.once(eventName, (...args) => resolve([...args]))
		if (timeout >= 0) setTimeout(() => reject(new Error(`Wait for event timeout (${timeout}ms)`)), timeout)
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

/*
** asyncMap(array, fn): Promise<Array>
*/
exports.asyncMap = async function (array, fn) {
	return await Promise.all(array.map(fn))
}

/*
** asyncForEach(array, fn): Promise<void>
*/
exports.asyncForEach = async function (array, fn) {
	for (let i = 0; i < array.length; i++) {
		await fn(array[i], i, array)
	}
}
