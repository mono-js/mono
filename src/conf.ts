import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { isArray, isObject, isRegExp, mergeWith, isUndefined } from 'lodash'

import { MonoLog } from './log'

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
		// If path is not an absolute paht but a node module
		if (['.', '/'].indexOf(path[0]) === -1) {
			path = join(this.appDir, 'node_modules', path)
			try {
				const pkg = require(join(path, 'package.json'))
				if (pkg.main) path = join(path, (pkg.main.slice(-1) === '/' ? pkg.main : dirname(pkg.main)))
				// tslint:disable-next-line:no-empty
			} catch (err) {}
		}
		// If relative path, make it absolute from srcDir
		if (path[0] === '.') path = join(this.srcDir, path)
		// Return new path
		return path
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

export default function(srcDir?: string): any {
	// Environement
	const env: string = process.env.NODE_ENV || 'development'
	// Conf path
	const confPath: string = process.env.MONO_CONF_PATH || join(srcDir, 'conf')
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
		try { require(filePath) } catch (err) { fileExists = false }
		// If config file does not exists
		if (!fileExists) {
			// Ignore for local.js file
			if (filename === 'local') return
			// throw an error for others
			this.log.error(`Could not load config file: ${filePath}`)
			process.exit(1)
		}
		// Load its source
		this.log.debug(`Loading ${filename} configuration`)
		const source = require(filePath)
		sources.push(source.default ? source.default : source)
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
	return defaultOptions.call({ appDir: this.appDir, srcDir }, conf)
}
