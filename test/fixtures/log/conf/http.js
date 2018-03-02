module.exports = {
	mono: {
		http: {
			logLevel: false
		},
		log: {
			console: false,
			http: [{
				port: 8000,
				path: '/log'
			}]
		}
	}
}
