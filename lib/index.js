// Node modules
const { join } = require('path')

// NPM modules
const appRootDir = require('app-root-dir')
const imperium = require('imperium')

// Mono Internals
const httpServer = require('./http')
const initModules = require('./init')
const loadACL = require('./acl')
const loadRoutes = require('./routes')
const initJWT = require('./jwt')
const { jwt } = require('./jwt')
const HttpError = require('./http-error')
const utils = require('./utils')
const loadConf = require('./conf')
const MonoLog = require('./log')

const appDir = appRootDir.get()
let pkg

// Set HttpError as global
global.HttpError = HttpError

// Check if a package.json exists
try {
	pkg = require(join(appDir, 'package.json'))
} catch (err) {
	throw new Error(`[mono] Could not find package.json in application directory ${appDir}`)
}

async function bootMonoModules(context) {
	const { conf, log } = context
	const modules = conf.mono.modules

	// Boot each modules in series
	for (const { name, path } of modules) {
		let module
		try {
			module = require(path)
		} catch (err) {
			// Do nothing
		}

		// If module does not export a function, exit
		if (typeof module !== 'function') return

		// Load module and log it
		log.debug(`Boot ${name} module`)
		await module(Object.assign({}, context, { log: log.module(name) }))
	}
}

function handleThrow(err) {
	throw err
}

module.exports = async function (dir) {
	dir = dir || appDir
	const srcDir = join(dir, 'src')

	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow)

	// Load configuration
	const conf = module.exports.conf = loadConf(dir, { log: module.exports.log, pkg, appDir })

	// Load logs
	const log = module.exports.log = new MonoLog(conf.name, conf.mono.log)
	log.profile('Startup')

	// Create HTTP server
	const { app, server, listen } = await httpServer({ conf, log })

	const context = { log, conf, app, server }
	// Boot mono modules
	await bootMonoModules(context)

	// Add JWT middleware (add req.generateJWT & req.loadSession)
	initJWT(conf.mono.jwt)

	// Init every modules
	await initModules(srcDir, context)

	// Load ACL
	await loadACL(srcDir, context)

	// Load routes
	await loadRoutes(srcDir, context)

	// Make the server listen
	if (!conf.mono.http.preventListen) await listen()
	log.profile('Startup')

	// Return app & server
	return context
}

module.exports.log = new MonoLog(pkg.name || 'mono')
module.exports.conf = {}
module.exports.imperium = imperium
module.exports.HttpError = HttpError
module.exports.UnauthorizedError = imperium.UnauthorizedError
module.exports.utils = utils
module.exports.jwt = jwt
