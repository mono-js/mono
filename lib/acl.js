const { join } = require('path')

const glob = require('glob-promise')

module.exports = async function (srcDir) {
	// Add mono modules (conf.mono.modules) to aclFiles
	this.conf.mono.modules.forEach(({ name, path }) => {
		path = join(path, 'acl.js')
		try {
			require(path)
			this.log.debug(`ACL loaded from ${name} module`)
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

	// Require all *.acl.js files
	projectACLFiles.forEach((name) => {
		// name is like users/users.init.js
		const path = join(srcDir, name)
		require(path)
		this.log.debug(`ACL loaded from ${name}`)
	})
}
