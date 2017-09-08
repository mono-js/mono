import { Server } from 'http'
import { existsSync } from 'fs'
import { join } from 'path'
import { Express } from 'express'
import * as appRootDir from 'app-root-dir'

import httpServer, { MonoHttp } from './http'
import initModules from './init'
import loadRoutes from './routes'
import jwtMiddleware, { MonoJWT } from './jwt'
import imperium, { Imperium, UnauthorizedError } from '@terrajs/imperium'

import HttpError from './http-error'
import * as utils from './utils'
import loadConf from './conf'
import { MonoLog } from './log'

export namespace Mono {
	export interface Options {
		modules?: string[]
		log?: MonoLog.Options
		http?: MonoHttp.Options
		jwt?: MonoJWT.Options
	}
	export interface Context {
		app: Express
		server: Server
	}
}

const appDir = appRootDir.get()
let pkg
try {
	pkg = require(join(appDir, 'package.json'))
} catch (err) {
	/* istanbul ignore next */
	// tslint:disable-next-line:no-console
	console.error(`[mono] Could not find package.json in application directory ${appDir}`)
	/* istanbul ignore next */
	process.exit(1)
}

export let log: MonoLog = new MonoLog(pkg.name || 'mono')
export let conf: any = {}
export const acl: Imperium = imperium
export { HttpError, UnauthorizedError, utils }
export { jwt } from './jwt'

export default async function (srcDir?: string): Promise<Mono.Context> {
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

async function bootMonoModules(modules: string[]) {
	const promises = modules.map(async (path) => {
		let module
		try {
			module = require(path)
			module = module.default || module
			// tslint:disable-next-line:no-empty
		} catch (err) { }
		if (typeof module !== 'function') return
		const moduleName = path.split('/').slice(-1)[0]
		log.debug(`Boot ${moduleName} mono module`)
		await module.call(this)
	})
	await Promise.all(promises)
}

/* istanbul ignore next */
function handleThrow(err) {
	throw err
}
