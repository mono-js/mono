import * as winston from 'winston'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose'

export namespace MonoLog {
	export interface Options {
		level?: LogLevel
		console?: boolean
		files?: FilesOptions[]
		http?: HttpOptions[]
		transports?: winston.TransportInstance[]
	}
	export interface FilesOptions {
		level?: LogLevel
		filename: string
		maxsize?: number
		maxFiles?: number
	}
	export interface HttpOptions {
		host?: string
		port?: number
		path?: string
		auth?: {
			username: string
			password: string
		}
		ssl?: boolean
	}
	export type ProfileMethod = (id: string, msg?: string, meta?: any, callback?: (err: Error, level: string, msg: string, meta: any) => void) => winston.LoggerInstance
}

export class MonoLog {

	public error: winston.LeveledLogMethod
	public warn: winston.LeveledLogMethod
	public info: winston.LeveledLogMethod
	public debug: winston.LeveledLogMethod
	public verbose: winston.LeveledLogMethod
	public profile: MonoLog.ProfileMethod
	public stream: { write: (message) => winston.LoggerInstance }

	private name: string
	private level: string
	private options: MonoLog.Options
	private log: winston.LoggerInstance

	constructor(name: string, options?: MonoLog.Options) {
		this.options = options || {}
		// Options
		this.name = name
		// tslint:disable-next-line:no-console
		this.level = process.env.MONO_LOG_LEVEL || this.options.level || 'verbose'
		this.options.console = (typeof this.options.console === 'boolean' ? this.options.console : true)
		this.options.files = this.options.files || []
		this.options.http = this.options.http || []
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
		this.stream = { write: (message) => this.debug(message) }
	}

	public module(name: string) {
		return new MonoLog(`${this.name}:${name}`, this.options)
	}

	private createLogger(level: string) {
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

	private getTransporters() {
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
		this.options.transports = this.options.transports || []
		this.options.transports.forEach((transport) => {
			transports.push(transport)
		})
		return transports
	}

}
