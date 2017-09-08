import { join } from 'path'
import { statSync } from 'fs'
import * as glob from 'glob-promise'

export default async function (srcDir: string, { app, server }) {
	let initFiles = []
	// Add mono modules (conf.mono.modules) to initFiles
	this.conf.mono.modules.forEach((path: string) => {
		path = join(path, 'module.init')
		try {
			require(path)
			// Add it to the list only if exists
			initFiles.push(path)
			// tslint:disable-next-line:no-empty
		} catch (err) { }
	})
	// Project modules (**/*.init.js)
	initFiles = initFiles.concat(await glob('modules/**/*.init.+(ts|js)', { cwd: srcDir }))
	// Initialize *.init files
	await Promise.all(initFiles.map(async (initFile) => {
		if (initFile[0] === '/') {
			const moduleName = initFile.split('/').slice(-2)[0]
			this.log.debug(`Init ${moduleName} mono module`)
		}	else {
			const moduleName = initFile.split('/').slice(-1)[0].split('.')[0]
			this.log.debug(`Init ${moduleName} project module`)
		}
		let module = require((initFile[0] === '/' ? initFile : join(srcDir, initFile)))
		module = module.default ? module.default : module
		if (typeof module === 'function') {
			await module.call(this, { app, server })
		}
	}))
}
