import { EventEmitter } from 'events'
import * as bcrypt from 'bcrypt'

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
export function cb(fn: (...args: any[]) => any, ...args: any[]): Promise<any> {
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
export function waitFor(ms?: number): Promise<any> {
	return new Promise((resolve) => setTimeout(resolve, ms || 0))
}

/*
** waitForEvent(emmiter, eventName)
*/
export function waitForEvent(emmiter: EventEmitter, eventName: string): Promise<any> {
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

/*
** hashPassword(password, saltRounds = 10): Promise<string>
*/
export async function hashPassword(password: string, saltRounds: number = 10): Promise<string> {
	const salt = await bcrypt.genSalt(saltRounds)

	return bcrypt.hash(password, salt)
}

/*
** hashPassword(password): Promise<boolean>
*/
export function verifyPassword(password: string, candidate: string): Promise<boolean> {
	return bcrypt.compare(candidate, password)
}
