const { join } = require('path')

const validate = require('express-validation')
const joiToJson = require('joi-to-json-schema')
const glob = require('glob-promise')
const { Router } = require('express')

const HttpError = require('./http-error')
const { acl } = require('./index')

const METHODS = ['get', 'post', 'put', 'delete', 'head', 'patch', 'all']

// Force allowUnkown as false
validate.options({
	allowUnknownHeaders: true,
	allowUnknownBody: false,
	allowUnknownQuery: false,
	allowUnknownParams: true,
	allowUnknownCookies: true
})

module.exports = async function (srcDir, app) {
	const log = this.log
	let routes = []
	let routeFiles = []
	
	// Send back its name for discovery
	app.get('/_', (req, res) => {
		res.status(200).send(this.conf.name)
	})

	// Monitoring route
	app.get('/_ping', (req, res) => {
		res.status(200).send('pong')
	})

	app.get('/_version', (req, res) => {
		res.status(200).send(this.conf.version)
	})

	// List all routes
	app.get('/_routes', (req, res) => {
		res.status(200).send(routes)
	})

	// Add mono modules (conf.mono.modules) to routeFiles
	this.conf.mono.modules.forEach((path) => {
		path = join(path, 'module.routes')
		try {
			require(path)
			// Add it to the list only if exists
			routeFiles.push(path)
		} catch (err) {
			// Do nothing
		}
	})

	// Find every module which export .routes.ts file
	routeFiles = routeFiles.concat(await glob('**/*.routes.js', {
		cwd: srcDir,
		nodir: true,
		ignore: 'node_modules/**'
	}))

	// Add routes for every module
	routeFiles.forEach((routeFile) => {
		let moduleName = routeFile.split('/').slice(-2)[0]

		if (routeFile[0] === '/') {
			log.debug(`Adding routes from ${moduleName} module`)
		}	else {
			moduleName = routeFile.replace(srcDir, '')
			log.debug(`Adding routes from ${moduleName}`)
		}

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
			// Validate method
			let validMethod = true
			if (!r.method) {
				log.error(`Module [${moduleName}]: Route ${r.path} must have a valid \`method\` (${METHODS.join(', ')})`)
				return false
			}
			r.method = (!Array.isArray(r.method) ? [r.method] : r.method).map((method) => String(method).toLowerCase())
			r.method.forEach((method) => {
				if (METHODS.indexOf(String(method).toLowerCase()) === -1) {
					validMethod = false
				}
			})
			if (!validMethod) {
				log.error(`Module [${moduleName}]: Route ${r.path} must have a valid \`method\` (${METHODS.join(', ')})`)
				return false
			}
			// Validate handler
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
			// Handle authentication (1st)
			r.session = r.session || false
			// Force session if acl defined (.is or .can)
			if (r.is || r.can) r.session = true
			if (r.session) {
				handler.push(authentication(r.session))
			}
			// Check ACL role (2nd)
			if (r.is) {
				handler.push(acl.is(r.is))
			}
			// Check ACL actions (3rd)
			if (r.can) {
				handler.push(acl.can(r.can))
			}
			// Add validation middleware validate schema defined (4th)
			r.validate = r.validate || r.validation
			if (r.validate) {
				handler.push(validate(r.validate))
			}
			r.handler = [...handler, ...r.handler]
			// Add route in express app, see http://expressjs.com/fr/4x/api.html#router.route
			r.method.forEach((method) => {
				let v = Array.isArray(r.version) ? r.version.join('|') : (r.version || '*')
				let optional = ''
				// If no version defined or accept any version
				if (v === '*') {
					v = 'v\\d+'
					optional = '?'
				}
				moduleRouter.route(`/:version(${v})${optional}${r.path}`)[method](r.handler)
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
	if (app.get('env') === 'development') {
		app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
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
	app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
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