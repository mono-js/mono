const { join } = require('path')
const nodemon = require('nodemon')
const chalk = require('chalk')

module.exports = (dir) => {
	const startPath = join(__dirname, 'start.js')

	nodemon({
		script: startPath,
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
		if (!files) return console.log(chalk.cyan(`[mono-dev] rs command, restarting...`)) // eslint-disable-line no-console
		console.log(chalk.cyan(`[mono-dev] File changed: ${files[0].replace(dir + '/', '')}`)) // eslint-disable-line no-console
	})
}
