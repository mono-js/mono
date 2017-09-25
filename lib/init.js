const { join } = require('path')
const { statSync } = require('fs')

const glob = require('glob-promise')

module.exports = async function (srcDir, { app, server }) {
	let initFiles = []

	// Add mono modules (conf.mono.modules) to initFiles
	this.conf.mono.modules.forEach((path) => {
		path = join(path, 'module.init')
		try {
			require(path)
			// Add it to the list only if exists
			initFiles.push(path)
		} catch (err) {}
	})

	// Project modules (**/*.init.js)
	initFiles = initFiles.concat(await glob('**/*.init.js', {
		cwd: srcDir,
		nodir: true,
		ignore: 'node_modules/**'
	}))

	// Initialize *.init files in parallel
	const initPromises = initFiles.map(async (initFile) => {
		// If absolute path, mono module
		if (initFile[0] === '/') {
			const moduleName = initFile.split('/').slice(-2)[0]
			this.log.debug(`Init ${moduleName} module`)
		}	else {
			const moduleName = initFile.replace(srcDir, '')
			this.log.debug(`Init ${moduleName}`)
		}

		// Require module
		let module = require((initFile[0] === '/' ? initFile : join(srcDir, initFile)))

		// Load module and wait for it to be initialized
		if (typeof module === 'function') {
			await module.call(this, { app, server })
		}
	})

	// Wait for promises to be resolved
	await Promise.all(initPromises)
}
