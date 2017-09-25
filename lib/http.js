const { createServer, Server } = require('http')

const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const bodyParser = require('body-parser')

module.exports = async function (httpOptions) {
	// Default options
	const port = httpOptions.port = parseInt(process.env.PORT, 10) || httpOptions.port || 5000
	httpOptions.logLevel = (typeof httpOptions.logLevel !== 'undefined' ? httpOptions.logLevel : 'dev')
	httpOptions.host = process.env.HOST || httpOptions.host || 'localhost'
	httpOptions.bodyParser = httpOptions.bodyParser || {}
	// Create server & helpers
	const app = express()
	const server = createServer(app)
	// Listeners
	const analyzeError = (error) => {
		/* istanbul ignore if */
		if (error.syscall !== 'listen') {
			return error
		}
		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				return new Error(`Port ${port} requires elevated privileges`)
			case 'EADDRINUSE':
				return new Error(`Port ${port} is already in use`)
			/* istanbul ignore next */
			default:
				return error
		}
	}
	const onListening = () => {
		const addr = server.address()
		this.log.debug('Listening on port ' + addr.port)
	}
	// Listen method
	const listen = () => {
		return new Promise((resolve, reject) => {
			server.listen(port, httpOptions.host)
			server.on('error', (error) => {
				reject(analyzeError(error))
			})
			server.on('listening', () => {
				onListening()
				resolve()
			})
		})
	}
	// Middleware
	app.use(helmet(httpOptions.helmet))
	app.use(bodyParser.urlencoded(Object.assign({ extended: false }, httpOptions.bodyParser.urlencoded)))
	app.use(bodyParser.json(httpOptions.bodyParser.json))
	// Logger middleware
	if (typeof httpOptions.logLevel === 'string') {
		app.use(morgan(httpOptions.logLevel, { stream: this.log.stream }))
	}
	// Return app & server
	return { app, server, listen }
}
