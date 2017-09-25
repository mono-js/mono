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
			join(__dirname, '../custom-modules/foo'),
			join(__dirname, '../custom-modules/bar')
		]
	}
}