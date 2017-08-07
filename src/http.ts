import { createServer, Server } from 'http'

import * as express from 'express'
import * as morgan from 'morgan'
import * as helmet from 'helmet'
import * as bodyParser from 'body-parser'

import { Express } from 'express'
import { Mono } from './index'
import { MonoLog } from './log'

export namespace MonoHttp {
	export interface Options {
		logLevel?: string | false
		port?: number | string
	}
	export interface Context {
		app: Express
		server: Server
		listen: () => Promise<{}>
	}
}

export default async function(options: MonoHttp.Options): Promise<MonoHttp.Context> {
	// Default options
	options.port = options.port || process.env.PORT || 5000
	options.logLevel = (typeof options.logLevel !== 'undefined' ? options.logLevel : 'dev')
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
				return new Error(`Port ${options.port} requires elevated privileges`)
			case 'EADDRINUSE':
				return new Error(`Port ${options.port} is already in use`)
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
			server.listen(options.port)
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
	app.use(helmet())
	app.use(bodyParser.urlencoded({ extended: false }))
	app.use(bodyParser.json())
	// Logger middleware
	if (typeof options.logLevel === 'string') {
		app.use(morgan(options.logLevel, { stream: this.log.stream }))
	}
	// Return app & server
	return { app, server, listen }
}
