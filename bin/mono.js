#!/usr/bin/env node

const resolve = require('path').resolve
const mono = require('../')

require('sywac')
	.help('-h, --help')
	.version('-v, --version')
	.command('dev [dir]', {
		desc: 'Run mono into [dir] and watch for changes',
		paramsDesc: ['Path to run Mono, default: .'],
		run: (argv) => {
			const dir = resolve(argv.dir || '.')
			require('./cmds/dev')(dir)
		}
	})
	.command('start [dir]', {
		aliases: '*',
		desc: 'Run mono into [dir]',
		paramsDesc: ['Path to run Mono, default: .'],
		run: (argv) => {
			const dir = resolve(argv.dir || '.')
			mono(dir)
		}
	})
	.parseAndExit()
