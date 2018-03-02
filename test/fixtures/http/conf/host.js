const ip = require('ip')

module.exports = {
	mono: {
		http: {
			port: 6667,
			host: ip.address()
		}
	}
}
