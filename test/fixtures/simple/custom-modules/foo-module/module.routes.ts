export default [
	{
		method: 'GET',
		path: '/foo',
		handler(req, res) {
			res.json({ foo: 'bar' })
		}
	}
]
