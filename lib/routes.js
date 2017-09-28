const { join } = require('path')

const validate = require('express-validation')
const joiToJson = require('joi-to-json-schema')
const glob = require('glob-promise')
const imperium = require('@terrajs/imperium')
const { Router } = require('express')

const { jwt } = require('./jwt')
const HttpError = require('./http-error')

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
	this.conf.mono.modules.forEach(({ name, path }) => {
		path = join(path, 'module.routes')
		try {
			require(path)
			// Add it to the list only if exists
			routeFiles.push({ isModule: true, name, path })
		} catch (err) {
			// Do nothing
		}
	})

	// Find every module which export .routes.js file
	let projectRouteFiles = await glob('**/*.routes.js', {
		cwd: srcDir,
		nodir: true,
		ignore: 'node_modules/**'
	})
	projectRouteFiles = projectRouteFiles.map((name) => {
		// name is like users/users.routes.js
		const path = join(srcDir, name)
		return { isModule: false, name, path }
	})
	routeFiles = routeFiles.concat(projectRouteFiles)

	// Add routes for every module
	routeFiles.forEach(({ isModule, name, path }) => {
		if (isModule) {
			log.debug(`Adding routes from ${name} module`)
		}	else {
			log.debug(`Adding routes from ${name}`)
		}

		// Create Express Router
		const moduleRouter = Router()

		// Fetch exported routes by the module
		let moduleRoutes = require(path)
		moduleRoutes = moduleRoutes.default ? moduleRoutes.default : moduleRoutes
		if (!Array.isArray(moduleRoutes)) {
			log.error(`Module [${name}]: No valid exported routes (should be an array)`)
			return
		}

		// Create route handle for the exported routes
		moduleRoutes = moduleRoutes.filter((r, index) => {
			// Validate required params
			if (!r.path) {
				log.error(`Module [${name}]: Route with index [${index}] must have a \`path\` defined.`)
				return false
			}
			// Validate method
			let validMethod = true
			if (!r.method) {
				log.error(`Module [${name}]: Route ${r.path} must have a valid \`method\` (${METHODS.join(', ')})`)
				return false
			}
			r.method = (!Array.isArray(r.method) ? [r.method] : r.method).map((method) => String(method).toLowerCase())
			r.method.forEach((method) => {
				if (METHODS.indexOf(String(method).toLowerCase()) === -1) {
					validMethod = false
				}
			})
			if (!validMethod) {
				log.error(`Module [${name}]: Route ${r.path} must have a valid \`method\` (${METHODS.join(', ')})`)
				return false
			}
			// Validate handler
			if (!r.handler) {
				log.error(`Module [${name}]: Route ${r.method.join('/').toUpperCase()} - ${r.path} must have a \`handler\` attached`)
				return false
			}
			// Create real handler
			const handler = []
			// Make sure r.handler is an array
			r.handler = (!Array.isArray(r.handler) ? [r.handler] : r.handler)
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
			// Prevent the usage of is AND can
			if (r.is && r.can) {
				log.error(`Module [${name}]: Route ${r.method[0].toUpperCase()} - ${r.path} must use either "can" or "is", but not both`)
				return false
			}
			if (r.session) {
				handler.push(authentication(r.session))
			}
			// Check ACL role (2nd)
			if (r.is) {
				handler.push(imperium.is(r.is))
			}
			// Check ACL actions (3rd)
			if (r.can) {
				handler.push(imperium.can(r.can))
			}
			// Add validation middleware validate schema defined (4th)
			r.validation = r.validation || r.validate
			if (r.validation) {
				handler.push(validate(r.validation))
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
		routes = routes.concat(...moduleRoutes.filter((r) => !r.hidden).map((r) => {
			// Force version to be an array
			const versions = (!Array.isArray(r.version) ? [r.version || '*'] : r.version)
			// Force documentation key to be defined
			r.documentation = r.documentation || r.doc || {}
			// Return a route definition for each version
			return [].concat(...versions.map((version) => {
				return r.method.map((method) => {
					return {
						version,
						method,
						path: r.path,
						session: r.session,
						roles: getRoles(r),
						validation: {
							headers: r.validation && r.validation.headers ? joiToJson(r.validation.headers) : undefined,
							cookies: r.validation && r.validation.headers ? joiToJson(r.validation.cookies) : undefined,
							params: r.validation && r.validation.params ? joiToJson(r.validation.params) : undefined,
							query: r.validation && r.validation.query ? joiToJson(r.validation.query) : undefined,
							body: r.validation && r.validation.body ? joiToJson(r.validation.body) : undefined
						},
						documentation: r.documentation || {},
					}
				})
			}))
		}))
	})
	// Handle 404 errors
	app.use((req, res, next) => {
		return next(new HttpError('not-found', 404, { url: req.url }))
	})
	app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
		// If validation error
		if (err instanceof validate.ValidationError) {
			err.message = 'validation-error'
			err.context = err.errors
		}
		const status = err.status || 500
		const code = err.message || 'unspecified-error'
		const context = err.context || {}
		if (status >= 500) {
			log.error(err)
		}
		// Log all errors (except 404) on console in development
		if (app.get('env') === 'development' && status < 500 && status !== 404) {
			log.warn(err)
		}
		res.status(status)
		res.json({
			code,
			status,
			context
		})
	})
}

function getRoles(route) {
	if (route.is) {
		const roleNames = Array.isArray(route.is) ? route.is : [route.is]
		return roleNames
	}
	if (!route.can) return []
	/*
	** Get roles from route actions
	*/
	const roles = []
	// Sanitize route actions
	let routeActions = Array.isArray(route.can) ? route.can : [route.can]
	routeActions = routeActions.map((action) => typeof action === 'string' ? { action } : action)
	// For each imperium roles
	Object.keys(imperium.roles).forEach((roleName) => {
		const roleActions = imperium.roles[roleName].actions
		// Role should have all route actions
		const roleValidActions = routeActions.filter((routeAction) => {
			const roleAction = roleActions.find((action) => action.action === routeAction.action)
			if (!roleAction) return false
			// Check role action params vs route action params
			let validParams = true
			Object.keys(roleAction.params).forEach((key) => {
				// Avoid running if validParams is false
				if (!validParams) return
				const roleParamValue = roleAction.params[key]
				// If roleParamsValue is *, go to next
				if (roleParamValue === '*') return
				// Get value of route param action
				const routeParamValue = routeAction[key] || '*'
				// If same value, go to next params
				if (roleParamValue === routeParamValue) return
				// If route param value is like :userId, role params value equivalent is @
				if (roleParamValue === '@' && routeParamValue.includes(':')) return
				// Invalid params
				validParams = false
			})
			return validParams
		})
		// If all defined actions are valid, add role
		if (roleValidActions.length === routeActions.length) {
			roles.push(roleName)
		}
	})
	return roles
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
			await jwt.loadSession(req, getToken)
		} catch (err) {
			if (type === 'require') {
				return next(err)
			}
		}
		next()
	}
}
