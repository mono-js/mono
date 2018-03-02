const ElasticSearch = require('winston-elasticsearch')

module.exports = {
	mono: {
		log: {
			console: false,
			transports: [
				new ElasticSearch({
					index: 'mono-log',
					level: 'info',
					mappingTemplate: require('winston-elasticsearch/index-template-mapping.json'),
					flushInterval: 200
				})
			]
		}
	}
}
