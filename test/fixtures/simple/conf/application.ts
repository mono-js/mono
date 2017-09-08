import { resolve } from 'path'

export default {
	mono: {
		http: {
			port: 8000
		},
		log: {
			level: 'verbose'
		},
		modules: [
			'undefined',
			resolve(__dirname, '../custom-modules/foo-module'),
			resolve(__dirname, '../custom-modules/bar-module')
		]
	}
}
