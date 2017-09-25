const winston = require('winston')

class MonoLog {

	constructor(name, options) {
		this.options = options || {}

		// Options
		this.name = name
		this.level = process.env.MONO_LOG_LEVEL || this.options.level || 'verbose'
		this.options.console = (typeof this.options.console === 'boolean' ? this.options.console : true)
		this.options.files = this.options.files || []
		this.options.http = this.options.http || []
		this.options.transports = this.options.transports || []

		// Logger
		this.log = this.createLogger(this.level)

		// Add methods
		this.error = this.log.error.bind(this.log)
		this.warn = this.log.warn.bind(this.log)
		this.info = this.log.info.bind(this.log)
		this.debug = this.log.debug.bind(this.log)
		this.verbose = this.log.verbose.bind(this.log)
		this.profile = this.log.profile.bind(this.log)

		// Add stream for morgan middleware
		this.stream = { write: (message) => this.debug(message.replace(/\n$/, '')) } // remove \n added by morgan at the end
	}

	module(name) {
		return new MonoLog(`${this.name}:${name}`, this.options)
	}

	createLogger() {
		const transports = this.getTransporters()

		// Instanciate the logger
		return new winston.Logger({
			transports,
			levels: {
				error: 0,
				warn: 1,
				info: 2,
				debug: 3,
				verbose: 4
			},
			colors: {
				error: 'red',
				warn: 'yellow',
				info: 'cyan',
				debug: 'green',
				verbose: 'blue'
			}
		})
	}

	getTransporters() {
		const transports = []

		// Add console transport
		if (this.options.console) {
			transports.push(
				new winston.transports.Console({
					colorize: true,
					level: this.level,
					label: this.name,
					timestamp: true,
					stderrLevels: ['error']
				})
			)
		}

		// Add file transport
		this.options.files.forEach((fileOptions, index) => {
			transports.push(
				new winston.transports.File({
					name: `file-transport-${index}`,
					level: this.level,
					...fileOptions
				})
			)
		})

		// Add http transport
		this.options.http.forEach((httpOptions, index) => {
			transports.push(
				new winston.transports.Http({
					name: `http-transport-${index}`,
					level: this.level,
					...httpOptions
				})
			)
		})

		// Add custom transports
		this.options.transports.forEach((transport) => {
			transports.push(transport)
		})

		return transports
	}

}

module.exports = MonoLog
