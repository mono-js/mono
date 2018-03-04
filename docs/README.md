## MONO

> Mono is a Web API Framework for Node.js based on Express.js

[![npm version](https://img.shields.io/npm/v/@terrajs/mono.svg)](https://www.npmjs.com/package/@terrajs/mono)
[![Travis](https://img.shields.io/travis/terrajs/mono/master.svg)](https://travis-ci.org/terrajs/mono)
[![Coverage](https://img.shields.io/codecov/c/github/terrajs/mono/master.svg)](https://codecov.io/gh/terrajs/mono)
[![license](https://img.shields.io/github/license/terrajs/mono.svg)](https://github.com/terrajs/mono/blob/master/LICENSE.md)

## What is it?

It is an opinionated web framework based on Express.js to build API by following the [best practices](https://github.com/i0natan/nodebestpractices) for Node.js applications.

Since it uses Express under the hood, you can use [any express middleware](https://www.npmjs.com/search?q=express%20middleware&page=1&ranking=optimal) into your Mono app.

See the [Quick start](quickstart.md) section to get started.

## Features

* :wrench: Environment based config
* :book: API Versionning (`v1`, `v2`...)
* :bust_in_silhouette: [Json Web Token](https://jwt.io) sessions
* :lock: ACL with [Imperium](https://terrajs.org/imperium)
* :vertical_traffic_light: Routes validation with [joi](https://github.com/hapijs/joi)
* :bookmark_tabs: Logs for application and API calls with [winston](https://github.com/winstonjs/winston) & [morgan](https://github.com/expressjs/morgan)
* :package: Extendable with [modules](modules.md) & [hooks](hooks.md)

## Modules

Mono is shipped with a lot of modules to help you focus on features instead of integrations.

See the [Modules](modules.md) section for more details.

## Core Team

| Avatar | Name | Github | Twitter |
|--------|------|--------|---------|
| ![Atinux](https://avatars1.githubusercontent.com/u/904724?s=50&v=4) | Sebastien Chopin | [Atinux](https://github.com/Atinux) | [Atinux](https://twitter.com/Atinux) |
| ![benjamincanac](https://avatars1.githubusercontent.com/u/739984?s=50&v=4) | Benjamin Canac | [benjamincanac](https://github.com/benjamincanac) | [benjamincanac](https://twitter.com/benjamincanac) |
| ![gaetansenn](https://avatars2.githubusercontent.com/u/2774075?s=50&v=4) | Gaetan Senn | [gaetansenn](https://github.com/gaetansenn) | [gaetan_senn](https://twitter.com/gaetan_senn) |
