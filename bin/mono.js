#!/usr/bin/env node

const resolve = require('path').resolve
const mono = require('../')
const dir = resolve(process.argv[2] || '.')

mono(dir)
