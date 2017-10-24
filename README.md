<h1 align="center"><img src="https://user-images.githubusercontent.com/904724/30934843-1ffda8d8-a3cf-11e7-9c01-dd043e31e89b.png" width="350" alt="Mono"/></h1>

> Mono is a REST API Framework for node.js

[![npm version](https://img.shields.io/npm/v/@terrajs/mono.svg)](https://www.npmjs.com/package/@terrajs/mono)
[![Travis](https://img.shields.io/travis/terrajs/mono/master.svg)](https://travis-ci.org/terrajs/mono)
[![Coverage](https://img.shields.io/codecov/c/github/terrajs/mono/master.svg)](https://codecov.io/gh/terrajs/mono)
[![license](https://img.shields.io/github/license/terrajs/mono.svg)](https://github.com/terrajs/mono/blob/master/LICENSE.md)

## Features

- Environment based config
- API Versionning (`v1`, `v2`...)
- [Json Web Token](https://jwt.io) sessions
- ACL with [Imperium](https://github.com/terrajs/imperium)
- Routes validation with [joi](https://github.com/hapijs/joi)
- Init files via `src/**/*.init.js`
- Routes declaration via `src/**/*.routes.js`
- Extendable with modules 

## Usage

**INFO:** You need `node` >= `8.0.0` to use Mono since it uses native `async/await`

### Installation

You can boostrap a Mono project by using our official [create-mono-app](https://github.com/terrajs/create-mono-app):

```bash
npx create-mono-app my-app
```

### Start in development

```bash
npm run dev
```

### Start in production

```bash
NODE_ENV=production npm start
```

### Run the tests with coverage

```bash
npm test
```

## Official Modules

Mono offers a module system to plug any functionality in your project:

- [mono-mongodb](https://github.com/terrajs/mono-mongodb)
- [mono-elasticsearch](https://github.com/terrajs/mono-elasticsearch)
- [mono-redis](https://github.com/terrajs/mono-redis)
- [mono-io](https://github.com/terrajs/mono-io)
- [mono-push](https://github.com/terrajs/mono-push)
- [mono-notifications](https://github.com/terrajs/mono-notifications)
- [mono-doc](https://github.com/terrajs/mono-doc)

## Getters

```js
const { conf, log, imperium, jwt, HttpError } = require('@terrajs/mono')
```

## Utils

Mono is shipped with useful utils:

```js
const { ok, cb, waitFor, ... } = require('@terrajs/mono/utils')
```

Methods:
- `ok(promise: Object): Promise`
- `cb(fn: Function, ...args: any[]): Promise`
- `waitFor(ms: number): Promise`
- `waitForEvent(emitter: EventEmitter, eventName: string, timeout: number = -1): Promise<Array>`
- `asyncObject(obj: Object): Promise<Object>`

We developped other utils that you might want useful:
- [mongodb-utils](https://github.com/terrajs/mongodb-utils)
- [elasticsearch-utils](https://github.com/terrajs/elasticsearch-utils)
- [mono-test-utils](https://github.com/terrajs/mono-test-utils)

## Mono Configuration

You project configuration should be inside the `conf/` directory.

Mono will load and merge these files in this order:

1. `conf/application.js`
2. `conf/${process.env.NODE_ENV}.js`
3. `conf/local.js` (should be inside `.gitignore`)

All these files should export an `Object`, to configure Mono, use the `mono` property.

## mono

> Configuration of Mono

- Type: `object`
- Default: `{}`

Properties:
- [modules](#modules)
- [http](#http)
- [jwt](#jwt)
- [log](#log)

### modules

> Modules to use with Mono, it can be the name of a node module or an absolute path to a directory. See for example [mono-mongodb](https://github.com/terrajs/mono-mongodb).

- Type: `array`
- Default: `[]`

### http

> HTTP configuration of Mono server

- Type: `object`
- Default: `{}`

  ### logLevel

> Log level/format for the HTTP requests, the value will be given to [morgan](https://github.com/expressjs/morgan) middleware. If `false`, no HTTP log will be made.

- Type: `string` or `false`
- Default: `'dev'`

  ### port

> Port number where the HTTP server will listen, can be overwriten by `PORT` environment variable.

- Type: `number`
- Default: `8000`

  ### preventListen

> Prevent server to listen (useful to make some scripts based on your services). 

- Type: `boolean`
- Default: `false`

### jwt

> Json Web Token configuration.

- Type: `object`
- Default: `{}`

  ### secret

> Secret key to encode the JWT.

- Type: `string`
- Default: `'secret'`

  ### expiresIn

> JWT expiration time, option given directly to [jwt.sign](https://github.com/auth0/node-jsonwebtoken#usage).

- Type: `number` or `string`
- Default: `'7d'`

  ### headerKey

> HTTP header key to look for the JWT.

- Type: `string`
- Default: `'Authorization'`

### log

> Log configuration, it uses [winston](https://github.com/winstonjs/winston) under the hood.

- Type: `object`
- Default: `{}`

  ### level

> Log level to write, can be overwritten by `MONO_LOG_LEVEL` environment variable.

- Type: `string`
- Default: `'verbose'`
- Available values: `'verbose'`, `'debug'`, `'info'`, `'warn'`, `'error'`

  ### console

> Write logs in the console (stdout and stderr).

- Type: `boolean`
- Default: `true`

  ### files

> Write logs in file(s).

- Type: `array`
- Default: `[]`

Properties:
- filename: `string`, **required**, path to log file.
- level: `string`, *optional*, default to `log.level`, log level to write in file.
- See [winston file transport](https://github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport) for the full list of properties

  ### http

> Stream logs to an http endpoint.

- Type: `array`
- Default: `[]`

Properties:
- level: `string`, *optional*, default to `log.level`, log level to write in file.
- See [winston http transport](https://github.com/winstonjs/winston/blob/master/docs/transports.md#http-transport) for the full list of properties

  ### transports

> Use custom Winton tranporter to send logs to.

- Type: `array`
- Default: `[]`

See [winston custom transport](https://github.com/winstonjs/winston/blob/master/docs/transports.md#winston-more) for the full list of properties

## Credits

Logo created by Frederick Allen from the Noun Project.
