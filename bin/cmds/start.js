const { resolve } = require('path')
const mono = require('../../')
const dir = resolve(process.argv[2] || '.')

mono(dir)
