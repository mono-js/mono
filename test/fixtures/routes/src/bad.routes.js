module.exports = [
	{
		// Nothing inside
	},
	{
		path: '/no-method',
		// No method
	},
	{
		path: '/bad-method',
		// Bad method
		method: 'bad'
	},
	{
		path: '/bad-method',
		method: 'get'
		// No handler
	},
	{
		method: 'get',
		path: '/bad-acl',
		// Error, cannot use can & is
		can: [],
		is: [],
		handler(req, res) {
			res.json({ ok: true })
		}
	}
]
