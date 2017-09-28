const { join, dirname } = require('path')
const { isArray, isObject, isRegExp, mergeWith, isUndefined } = require('lodash')
const clearModule = require('clear-module')

// Customizer method to merge sources
function customizer(objValue, srcValue) {
	if (isUndefined(objValue) && !isUndefined(srcValue)) return srcValue
	if (isArray(objValue) && isArray(srcValue)) return srcValue
	if (isRegExp(objValue) || isRegExp(srcValue)) return srcValue
	if (isObject(objValue) || isObject(srcValue)) return mergeWith(objValue, srcValue, customizer)
}

function defaultOptions(conf) {
	conf.mono = conf.mono || {}

	// Modules options
	conf.mono.modules = conf.mono.modules || []
	conf.mono.modules = conf.mono.modules.map((path) => {
		let name
		// If path is not an absolute path but a node module
		if (['.', '/'].indexOf(path[0]) === -1) {
			path = join(this.appDir, 'node_modules', path)
		}
		// If relative path, make it absolute from dir
		if (path[0] === '.') path = join(this.dir, path)
		// Make sure path ends by /
		if (path.slice(-1) !== '/') path += '/'
		// If the package.json is present
		try {
			const pkg = require(join(path, 'package.json'))
			if (pkg.main) path = join(path, (pkg.main.slice(-1) === '/' ? pkg.main : dirname(pkg.main)))
			name = pkg.name
		} catch (err) {
			// Do nothing
		}
		// If no name, get it from path
		if (!name) name = path.split('/').slice(-2)[0]
		// Return new path
		return { name, path }
	})

	// Log options
	conf.mono.log = conf.mono.log || {}

	// Http options
	conf.mono.http = conf.mono.http || {}

	// JWT options
	conf.mono.jwt = conf.mono.jwt || {}

	// Return updated conf
	return conf
}

module.exports = function (dir) {
	// Environement
	const env = process.env.NODE_ENV || 'development'
	this.log.debug(`Environment: ${env}`)

	// Conf path
	const confPath = process.env.MONO_CONF_PATH || join(dir, 'conf')

	// Files to load
	const files = [
		'application',
		`${env}`,
		'local'
	]

	// Sources of each config file
	const sources = []

	// Load each file
	files.forEach((filename) => {
		const filePath = join(confPath, filename)
		let fileExists = true
		let source

		// Try to load config file
		try {
			source = require(filePath)
			clearModule(filePath)
		} catch (err) { fileExists = false }

		// If config file does not exists
		if (!fileExists) {
			// Ignore for local.js file
			if (filename === 'local') return
			// Log an error for others
			return this.log.warn(`Could not load config file: conf/${filename}.js`)
		}

		// Load its source
		this.log.debug(`Loading conf/${filename}.js configuration`)
		sources.push(source)
	})

	// Add env, name & version to the returned config
	sources.push({
		env,
		name: this.pkg.name,
		version: this.pkg.version
	})

	// Merged sources with conf
	const conf = mergeWith.apply(null, [...sources, customizer])

	// Return conf
	return defaultOptions.call({ appDir: this.appDir, dir }, conf)
}
