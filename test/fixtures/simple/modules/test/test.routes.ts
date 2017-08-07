export default [
	{
		method: 'GET',
		path: '/users',
		// is: 'admin',
		can: 'seeUsers',
		handler(req, res) {
			res.json([])
		}
	}
]
