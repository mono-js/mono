#!/usr/bin/env node

const { join, resolve } = require('path')
const nodemon = require('nodemon')
const chalk = require('chalk')
const dir = resolve(process.argv[2] || '.')

const monoPath = join(__dirname, 'mono.js')

nodemon({
	script: monoPath,
	args: [dir],
	ext: 'js json',
	ignore: [
		'.git',
		'.idea',
		'.vscode',
		'coverage',
		'.nyc_output',
		'node_modules'
	],
	watch: [
		join(dir, 'conf'),
		join(dir, 'src')
	]
});

nodemon.on('start', () => {
  console.log(chalk.green('[mono-dev] Starting project...')) // eslint-disable-line no-console
})
.on('quit', () => {
  process.exit()
}).on('restart', (files) => {
  console.log(chalk.cyan(`[mono-dev] File changed: ${files[0].replace(dir + '/', '')}`)) // eslint-disable-line no-console
})
