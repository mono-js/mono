const { join } = require('path')

const glob = require('glob-promise')

module.exports = async function (srcDir, context) {
	const { conf, log } = context
	let initFiles = []

	// Add mono modules (conf.mono.modules) to initFiles
	conf.mono.modules.forEach(({ name, path }) => {
		path = join(path, 'init.js')
		try {
			require(path)
		// Add it to the list only if exists
			initFiles.push({ isModule: true, name, path })
		} catch (err) {
			// Do nothing
		}
	})

	// Project modules (**/*.init.js)
	let projectInitFiles = await glob('**/*.init.js', {
		cwd: srcDir,
		nodir: true,
		ignore: 'node_modules/**'
	})
	projectInitFiles = projectInitFiles.map((name) => {
		// name is like users/users.init.js
		const path = join(srcDir, name)
		return { isModule: false, name, path }
	})
	initFiles = initFiles.concat(projectInitFiles)

	// Initialize *.init files in parallel
	const initPromises = initFiles.map(async ({ isModule, name, path}) => {
		// If mono module
		if (isModule) {
			log.debug(`Init ${name} module`)
		}	else {
			log.debug(`Init ${name}`)
		}

		// Require module
		let module = require(path)

		// Load module and wait for it to be initialized
		if (typeof module === 'function') {
			await module(Object.assign({}, context, { log: log.module(name) }))
		}
	})

	// Wait for promises to be resolved
	await Promise.all(initPromises)
}
