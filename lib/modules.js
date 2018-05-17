const debug = require('debug')('mono:modules')

module.exports = async function (context) {
	const { conf, log } = context
	const modules = conf.mono.modules

	// Boot each modules in series
	for (const { name, path } of modules) {
		let module
		try {
			debug(`Loading mono module from ${path}`)
			module = require(path)
		} catch (err) {
			// Do nothing
			continue
		}

		// If module does not export a function, exit
		if (typeof module !== 'function') continue

		// Load module and log it
		log.debug(`Boot ${name} module`)
		await module(Object.assign({}, context, { log: log.module(name) }))
	}
}
