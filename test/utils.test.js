const test = require('ava')
const EventEmitter = require('events').EventEmitter

const { asyncObject, waitFor, cb, ok, waitForEvent, asyncMap, asyncForEach } = require('../lib/utils')

async function p(val, delay = 0) {
	await waitFor(delay)
	return val
}

async function fail(delay = 0) {
	await waitFor(delay)
	throw new Error('fail')
}

/*
** asyncObject
*/
test('Returns the results of promises + non-promises', async (t) => {
	const res = await asyncObject({
		foo: p('foo'),
		bar: p('bar'),
		baz: p('baz'),
		n: null,
		u: undefined
	})
	const expected = { foo: 'foo', bar: 'bar', baz: 'baz', n: null, u: undefined }
	t.deepEqual(res, expected)
})

test('Returns empty object with no parameter', async (t) => {
	const obj = await asyncObject()
	t.deepEqual(obj, {})
})

test('Throws an error is one promise throws', async (t) => {
	const err = await t.throws(asyncObject({
		foo: fail(100),
		bar: p('bar'),
		fail: fail()
	}))
	t.is(err.message, 'fail')
})

/*
** cb
*/
function read(file, callback) {
	if (file === 'foo.txt') {
		return setTimeout(() => callback(null, 'contents'), 0)
	}
	setTimeout(() => callback(new Error('file not found')), 0)
}

test('Passes args and receives results', async (t) => {
	const result = await cb(read, 'foo.txt')
	t.is(result, 'contents')
})

test('Throws an error if (err) is truthy', async (t) => {
	const err = await t.throws(cb(read, 'bar.txt'))
	t.is(err.message, 'file not found')
})

/*
** ok
*/
test('Returns a value on success', async (t) => {
	const foo = await ok(p('foo'))
	t.is(foo, 'foo')
})

test('Returns undefined on error', async (t) => {
	const res = await ok(fail())
	t.is(res, undefined)
})

/*
** waitForEvent
*/
function newEmitter(eventName, ms, ...args) {
	const emitter = new EventEmitter()
	setTimeout(() => {
		emitter.emit(eventName, ...args)
	}, ms)

	return emitter
}

test('Should wait until event is emitted', async (t) => {
	const emitter = newEmitter('listen', 100)
	const start = Date.now()
	await waitForEvent(emitter, 'listen')
	t.true(Date.now() - start >= 90)
})

test('Should work without parameter', async (t) => {
	const emitter = newEmitter('close', 10, 'foo', 123)
	const res = await waitForEvent(emitter, 'close')
	t.deepEqual(res, ['foo', 123])
})

test('Should trigger timeout', async (t) => {
	const emitter = new EventEmitter()
	const error = await t.throws(waitForEvent(emitter, 'close', 100))
	t.true(error.message.includes('Wait for event timeout (100ms)'))
})

/*
** waitFor
*/
test('Should wait for 100ms', async (t) => {
	const start = Date.now()
	await waitFor(100)
	t.true(Date.now() - start >= 100)
})

test('Should work without parameter', async (t) => {
	const start = Date.now()
	await waitFor()
	t.true(Date.now() - start <= 30)
})

/*
** asyncMap
*/
test('Returns the results of promises + non-promises', async (t) => {
	const res = await asyncMap(['foo', 'bar', 'baz', null, undefined], (doc) => p(doc))
	const expected = ['foo', 'bar', 'baz', null, undefined]
	t.deepEqual(res, expected)
})

/*
** asyncForEach
*/
test('Returns the results of promises + non-promises', async (t) => {
	const array = ['foo', 'bar', 'baz', null, undefined]
	const res = {}
	await asyncForEach(array, async (value) => {
		await waitFor(10)
		res[String(value)] = value
	})
	const expected = {
		'foo': 'foo',
		'bar': 'bar',
		'baz': 'baz',
		'null': null,
		'undefined': undefined
	}
	t.deepEqual(res, expected)
})
