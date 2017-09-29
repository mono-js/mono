const join = require('path').join

module.exports = {
	mono: {
		http: {
			port: 8000
		},
		log: {
			level: 'verbose'
		},
		modules: [
			join(__dirname, '../modules/db'),
			join(__dirname, '../modules/unknown')
		]
	}
}
