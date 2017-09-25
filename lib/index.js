// Node modules
const { existsSync } = require('fs')
const { join } = require('path')

// NPM modules
const appRootDir = require('app-root-dir')
const imperium = require('@terrajs/imperium')

// Mono Internals
const httpServer = require('./http')
const initModules = require('./init')
const loadRoutes = require('./routes')
const jwtMiddleware, { jwt } = require('./jwt')
const HttpError = require('./http-error')
const utils = require('./utils')
const loadConf = require('./conf')
const MonoLog = require('./log')

const appDir = appRootDir.get()
let pkg

// Check if a package.json exists
try {
	pkg = require(join(appDir, 'package.json'))
} catch (err) {
	throw new Error(`[mono] Could not find package.json in application directory ${appDir}`)
}

exports.log = new MonoLog(pkg.name || 'mono')
exports.conf = {}
exports.acl = imperium
exports.HttpError = HttpError
exports.UnauthorizedError = imperium.UnauthorizedError
exports.utils = utils
exports.jwt = jwt

export default async function (srcDir) {
	srcDir = srcDir || appDir

	// Provides a stack trace for unhandled rejections instead of the default message string.
	process.on('unhandledRejection', handleThrow)

	// Load configuration
	conf = loadConf.call({ log, pkg, appDir }, srcDir)

	// Load logs
	log = new MonoLog(conf.name, conf.mono.log)
	log.profile('startup')

	// Boot mono modules
	await bootMonoModules.call({ log, conf, appDir }, conf.mono.modules)

	// Create HTTP server
	const { app, server, listen } = await httpServer.call({ log }, conf.mono.http)

	// Add JWT middleware (add req.generateJWT & req.loadSession)
	jwtMiddleware(conf.mono.jwt, app)

	// Init every modules
	await initModules.call({ log, conf, appDir, pkg }, srcDir, { app, server })

	// Load routes
	await loadRoutes.call({ log, conf, appDir }, srcDir, app)

	// Make the server listen
	await listen()
	log.profile('startup')

	// Return app & server
	return { app, server }
}

async function bootMonoModules(modules) {
	// For each module
	const promises = modules.map(async (path) => {
		let module
		try {
			module = require(path)
		} catch (err) {}

		// If module does not export a function, exit
		if (typeof module !== 'function') return

		// Load module and log it
		const moduleName = path.split('/').slice(-1)[0]
		log.debug(`Boot ${moduleName} mono module`)
		await module.call(this)
	})

	// Wait for modules to be loaded
	await Promise.all(promises)
}

function handleThrow(err) {
	throw err
}
