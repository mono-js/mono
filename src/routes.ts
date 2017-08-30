import { join } from 'path'

import * as validate from 'express-validation'
import * as joiToJson from 'joi-to-json-schema'
import * as glob from 'glob-promise'
import { Router, Express } from 'express'

import HttpError from './http-error'
import { Mono, acl } from './index'

const METHODS = ['get', 'post', 'put', 'delete', 'head', 'patch', 'all']

// Force allowUnkown as false
validate.options({
	allowUnknownHeaders: true,
	allowUnknownBody: false,
	allowUnknownQuery: false,
	allowUnknownParams: true,
	allowUnknownCookies: true
})

export default async function (srcDir: string, app: Express) {
	// Fetch application name
	const log = this.log
	// Create the routes list
	let routes = []
	// Send back its name for discovery
	app.get('/', (req, res) => {
		res.status(200).send(this.conf.name)
	})
	// Monitoring route
	app.get('/ping', (req, res) => {
		res.status(200).send('pong')
	})
	app.get('/version', (req, res) => {
		res.status(200).send(this.conf.version)
	})
	if (this.conf.env === 'development') {
		// List all routes
		app.get('/routes', (req, res) => {
			res.status(200).send(routes)
		})
	}
	const moduleFiles = []
	let routeFiles = []
	// Add mono modules (conf.mono.modules) to routeFiles
	this.conf.mono.modules.forEach((path: string) => {
		path = join(path, 'module.routes')
		try {
			require(path)
			// Add it to the list only if exists
			routeFiles.push(path)
			// tslint:disable-next-line:no-empty
		} catch (err) { }
	})
	// Find every module which export .routes.ts file
	routeFiles = routeFiles.concat(await glob('modules/**/*.routes.+(ts|js)', { cwd: srcDir }))
	// Add routes for every module
	routeFiles.forEach((routeFile) => {
		const moduleName = routeFile.split('/').slice(-2)[0]
		if (routeFile[0] === '/') log.debug(`Adding ${moduleName} mono module routes`)
		else log.debug(`Adding ${moduleName} project module routes`)
		// Create Express Router
		const moduleRouter = Router()
		// Fetch exported routes by the module
		let moduleRoutes = require((routeFile[0] === '/' ? routeFile : join(srcDir, routeFile)))
		moduleRoutes = moduleRoutes.default ? moduleRoutes.default : moduleRoutes
		if (!Array.isArray(moduleRoutes)) {
			log.error(`Module [${moduleName}]: No valid exported routes (should be an array)`)
			return
		}
		// Create route handle for the exported routes
		moduleRoutes = moduleRoutes.filter((r, index) => {
			// Validate required params
			if (!r.path) {
				log.error(`Module [${moduleName}]: Route with index [${index}] must have a \`path\` defined.`)
				return false
			}
			if (!r.method) {
				log.error(`Module [${moduleName}]: Route ${r.path} must have a valid \`method\` (${METHODS.join(', ')})`)
				return false
			}
			r.method = (!Array.isArray(r.method) ? [r.method] : r.method).map((method) => String(method).toLowerCase())
			let validMethod = true
			r.method.forEach((method) => {
				if (METHODS.indexOf(String(method).toLowerCase()) === -1)
					validMethod = false
			})
			if (!validMethod) {
				log.error(`Module [${moduleName}]: Route ${r.path} must have a valid \`method\` (${METHODS.join(', ')})`)
				return false
			}
			if (!r.handler) {
				log.error(`Module [${moduleName}]: Route ${r.method.join('/').toUpperCase()} - ${r.path} must have a \`handler\` attached`)
				return false
			}
			// Create real handler
			const handler = []
			// Make sure r.handler is an array
			r.handler = (!Array.isArray(r.handler) ? [r.handler] : r.handler)
			// Overwrite r.name before overwritting the handler
			r.name = r.name || r.handler[r.handler.length - 1].name
			// Make sure there is a try/catch for each controller to avoid crashing the server
			r.handler = r.handler.map((fn) => {
				return async (req, res, next) => {
					try {
						await fn(req, res, next)
					} catch (err) {
						next(err)
					}
				}
			})
			// Handle versionning (1st)
			handler.push(versionning(r.version))
			// Handle authentication (2nd)
			r.session = r.session || false
			// Force session if acl defined (.is or .can)
			if (r.is || r.can) r.session = true
			if (r.session) {
				handler.push(authentication(r.session))
			}
			// Check ACL role
			if (r.is) {
				handler.push(acl.is(r.is))
			}
			// Check ACL actions
			if (r.can) {
				handler.push(acl.can(r.can))
			}
			// Add validation middleware validate schema defined (3rd)
			r.validate = r.validate || r.validation
			if (r.validate) {
				handler.push(validate(r.validate))
			}
			r.handler = [...handler, ...r.handler]
			// Add route in express app, see http://expressjs.com/fr/4x/api.html#router.route
			r.method.forEach((method) => {
				moduleRouter.route(`/:version(v\\d+)?${r.path}`)[method](r.handler)
			})
			return true
		})
		// Add module routes to the app
		app.use(moduleRouter)
		// Add routes definitions to /routes
		routes = routes.concat(...moduleRoutes.map((r) => {
			// Force version to be an array
			const versions = (!Array.isArray(r.version) ? [r.version || '*'] : r.version)
			// Force documentation key to be defined
			r.documentation = r.documentation || {}
			// Return a route definition for each version
			return [].concat(...versions.map((version) => {
				return r.method.map((method) => {
					const module = routeFile.split('/')[0]
					return {
						module,
						name: r.name || `${r.method}${module[0].toUpperCase()}${module.slice(1)}`,
						description: r.documentation.description || '',
						version,
						method,
						path: (version !== '*' ? `/${version}${r.path}` : r.path),
						session: r.session,
						is: r.is,
						can: r.can,
						validate: {
							headers: r.validate && r.validate.headers ? joiToJson(r.validate.headers) : undefined,
							cookies: r.validate && r.validate.headers ? joiToJson(r.validate.cookies) : undefined,
							params: r.validate && r.validate.params ? joiToJson(r.validate.params) : undefined,
							query: r.validate && r.validate.query ? joiToJson(r.validate.query) : undefined,
							body: r.validate && r.validate.body ? joiToJson(r.validate.body) : undefined
						},
						response: r.documentation.response
					}
				})
			}))
		}))
	})
	// Handle 404 errors
	app.use((req, res, next) => {
		return next(new HttpError('not-found', 404, { url: req.url }))
	})
	// Development error handler will print stacktrace
	/* istanbul ignore else */
	if (app.get('env') === 'development') {
		app.use((err, req, res, next) => {
			const status = err.status || 500
			const code = err.message || 'unspecified-error'
			const context = err.context || {}
			if (status < 500) {
				log.warn(err)
			} else {
				log.error(err)
			}
			res.status(status)
			res.json({
				code,
				status,
				context,
				error: (err instanceof HttpError ? err : undefined)
			})
		})
	}
	// Production error handler: no stacktraces leaked to user
	app.use((err, req, res, next) => {
		const status = err.status || 500
		const code = err.message || 'unspecified-error'
		const context = err.context || {}
		if (status >= 500) {
			log.error(err)
		}
		res.status(status)
		res.json({
			code,
			status,
			context
		})
	})
}

function versionning(version) {
	return (req, res, next) => {
		// If no version defined for the route, ignore actual version
		if (!version) {
			return next()
		}
		// Force version to be an array
		version = (!Array.isArray(version) ? [version] : version)
		// Check if param version is matching the route version(s)
		if (version.includes(req.params.version || req.headers['api-version'])) {
			return next()
		}
		next(new HttpError('version-not-supported', 400, { version }))
	}
}

function authentication(options) {
	let getToken
	let type = 'require'
	if (typeof options === 'object') {
		if (['load', 'require'].indexOf(options.type) !== -1) {
			type = options.type
		}
		getToken = options.getToken
	}
	return async (req, res, next) => {
		try {
			await req.loadSession(getToken)
		} catch (err) {
			if (type === 'require') {
				return next(err)
			}
		}
		next()
	}
}
