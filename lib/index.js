// Node modules
const { join } = require('path')

// NPM modules
const appRootDir = require('app-root-dir')
const imperium = require('@terrajs/imperium')

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

async function bootMonoModules(modules) {
	// For each module
	const promises = modules.map(async ({ name, path }) => {
		let module
		try {
			module = require(path)
		} catch (err) {
			// Do nothing
		}

		// If module does not export a function, exit
		if (typeof module !== 'function') return

		// Load module and log it
		this.log.debug(`Boot ${name} module`)
		await module.call(this)
	})

	// Wait for modules to be loaded
	await Promise.all(promises)
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
	const conf = module.exports.conf = loadConf.call({ log: module.exports.log, pkg, appDir }, dir)

	// Load logs
	const log = module.exports.log = new MonoLog(conf.name, conf.mono.log)
	log.profile('Startup')

	// Boot mono modules
	await bootMonoModules.call({ log, conf, appDir }, conf.mono.modules)

	// Create HTTP server
	const { app, server, listen } = await httpServer.call({ log }, conf.mono.http)

	// Add JWT middleware (add req.generateJWT & req.loadSession)
	initJWT(conf.mono.jwt)

	// Init every modules
	await initModules.call({ log, conf, appDir, pkg }, srcDir, { app, server })

	// Load ACL
	await loadACL.call({ log, conf, appDir, pkg }, srcDir)

	// Load routes
	await loadRoutes.call({ log, conf, appDir }, srcDir, app)

	// Make the server listen
	if (!conf.mono.http.preventListen) await listen()
	log.profile('Startup')

	// Return app & server
	return { conf, app, server }
}

module.exports.log = new MonoLog(pkg.name || 'mono')
module.exports.conf = {}
module.exports.imperium = imperium
module.exports.HttpError = HttpError
module.exports.UnauthorizedError = imperium.UnauthorizedError
module.exports.utils = utils
module.exports.jwt = jwt
