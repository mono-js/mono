const join = require('path').join

module.exports = {
	mono: {
		modules: [
			join(__dirname, '../modules/api-key')
		]
	}
}
