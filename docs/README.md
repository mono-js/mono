## MONO

> Mono is a REST API Framework for Node.js based on Express.js

[![npm version](https://img.shields.io/npm/v/@terrajs/mono.svg)](https://www.npmjs.com/package/@terrajs/mono)
[![Travis](https://img.shields.io/travis/terrajs/mono/master.svg)](https://travis-ci.org/terrajs/mono)
[![Coverage](https://img.shields.io/codecov/c/github/terrajs/mono/master.svg)](https://codecov.io/gh/terrajs/mono)
[![license](https://img.shields.io/github/license/terrajs/mono.svg)](https://github.com/terrajs/mono/blob/master/LICENSE.md)

## What is it

Mono is an opinionated web framework to build REST API by following the [best practices](https://github.com/i0natan/nodebestpractices) for Node.js applications.

See the [Quick start](quickstart.md) for more details.

## Features

* Environment based config
* API Versionning (`v1`, `v2`...)
* [Json Web Token](https://jwt.io) sessions
* ACL with [Imperium](https://terrajs.org/imperium)
* Routes validation with [joi](https://github.com/hapijs/joi)
* Init files via `src/**/*.init.js`
* Routes declaration via `src/**/*.routes.js`
* Extendable with [modules](modules.md) & [hooks](hooks.md)

## Modules

Mono is shipped with a lot of modules to help you focus on features instead of integrations.

See the [Modules](modules.md) section for more details.

## Team

- Sebastien Chopin
- Benjamin Canac
- Gaetan Senn
