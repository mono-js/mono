const { join } = require('path')

module.exports = {
	mono: {
		modules: [
			'node-module',
			'./relative-path/',
			'mono-test-utils',
			join(__dirname, './main-module/'),
			join(__dirname, './no-main-module/')
		]
	}
}
