import { EventEmitter } from 'events'

/*
** ok(promise: Promise): <Promise>
*/
export async function ok(promise: Promise<any>): Promise<any> {
	try {
		return await promise
	} catch (err) {
		return
	}
}

/*
** cb(fn: Function, args: ...any): <Promise>
*/
export async function cb(fn: (...args: any[]) => any, ...args: any[]): Promise<any> {
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
export async function waitFor(ms?: number): Promise<any> {
	return new Promise((resolve) => setTimeout(resolve, ms || 0))
}

/*
** waitForEvent(emmiter, eventName)
*/
export async function waitForEvent(emmiter: EventEmitter, eventName: string): Promise<any> {
	return new Promise((resolve, reject) => {
		emmiter.once(eventName, (...args) => resolve([...args]))
	})
}

/*
** asyncObject(obj): Promise<Object>
*/
export async function asyncObject(obj = {}): Promise<any> {
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
