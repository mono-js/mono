const tmp = require('tmp')
const file = tmp.fileSync()

module.exports = {
	mono: {
		log: {
			console: false,
			files: [{
				filename: file.name
			}]
		}
	}
}
