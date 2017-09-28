const { join } = require('path')

const glob = require('glob-promise')

module.exports = async function (srcDir, { app, server, imperium }) {
	let aclFiles = []

	// Add mono modules (conf.mono.modules) to initFiles
	this.conf.mono.modules.forEach(({ name, path }) => {
		path = join(path, 'module.acl')
		try {
			require(path)
			// Add it to the list only if exists
			aclFiles.push({ isModule: true, name, path })
		} catch (err) {
			// Do nothing
		}
	})

	// Project modules (**/*.init.js)
	let projectACLFiles = await glob('**/*.acl.js', {
		cwd: srcDir,
		nodir: true,
		ignore: 'node_modules/**'
	})
	projectACLFiles = projectACLFiles.map((name) => {
		// name is like users/users.init.js
		const path = join(srcDir, name)
		return { isModule: false, name, path }
	})
	aclFiles = aclFiles.concat(projectACLFiles)

	// Initialize *.init files in parallel
	const aclPromises = aclFiles.map(async ({ isModule, name, path}) => {
		// If mono module
		if (isModule) {
			this.log.debug(`Load ACL from ${name} module`)
		}	else {
			this.log.debug(`Load ACL from ${name}`)
		}

		// Require module
		let module = require(path)

		// Load module and wait for it to be initialized
		if (typeof module === 'function') {
			await module.call(this, { imperium, app, server, conf: this.conf, log: this.log.module(name) })
		}
	})

	// Wait for promises to be resolved
	await Promise.all(aclPromises)
}
