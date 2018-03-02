// Node modules
const { join } = require('path')

// NPM modules
const appRootDir = require('app-root-dir')
const imperium = require('imperium')

// Mono Internals
const httpServer = require('./http')
const loadModules = require('./modules')
const initFiles = require('./init')
const loadACL = require('./acl')
const loadRoutes = require('./routes')
const initJWT = require('./jwt')
const { jwt } = require('./jwt')
const HttpError = require('./http-error')
const utils = require('./utils')
const loadConf = require('./conf')
const MonoLog = require('./log')
const Hooks = require('./hooks')

const appDir = appRootDir.get()
let pkg

// Set HttpError as global
global.HttpError = HttpError

// Check if a package.json exists
try {
	pkg = require(join(appDir, 'package.json'))
} catch (err) {
	/* istanbul ignore next */
	throw new Error(`[mono] Could not find package.json in application directory ${appDir}`)
}

/* istanbul ignore next */
function handleThrow(err) {
	throw err
}

module.exports = async function (dir) {
	dir = dir || /* istanbul ignore next */ appDir
	const srcDir = join(dir, 'src')

	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow)

	// Load configuration
	const conf = module.exports.conf = loadConf(dir, { log: module.exports.log, pkg, appDir })

	// Load logs
	const log = module.exports.log = new MonoLog(conf.name, conf.mono.log)
	log.profile('Startup')

	// Create hooks instance
	const hooks = new Hooks(log)

	// Create HTTP server
	const { app, server, listen } = await httpServer({ conf, log })

	const context = { log, conf, app, server, hook: hooks.hook }
	// Boot mono modules
	await loadModules(context)

	// Add JWT middleware (add req.generateJWT & req.loadSession)
	initJWT(conf.mono.jwt)

	// Init every *.init.js files (modules + project)
	await initFiles(srcDir, context)

	// Load ACL
	await loadACL(srcDir, context)

	// Load routes
	context.routes = await loadRoutes(srcDir, context, hooks)
	module.exports.routes = context.routes

	// Make the server listen
	if (!conf.mono.http.preventListen) await listen()
	log.profile('Startup')

	await hooks.callHook('ready', context)

	// Return app & server
	return context
}

module.exports.log = new MonoLog(pkg.name || /* istanbul ignore next */ 'mono')
module.exports.conf = {}
module.exports.imperium = imperium
module.exports.HttpError = HttpError
module.exports.UnauthorizedError = imperium.UnauthorizedError
module.exports.utils = utils
module.exports.jwt = jwt
