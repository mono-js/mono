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
const { HttpError, conf, log, imperium, jwt } = require('@terrajs/mono')
```

### HttpError

Custom error class (extends `Error`), used by Mono for API errors with status code and context.

```js
new HttpError(message [, statusCode] [, context])
```

Arguments:
- message: `string`, **required**
- status: `number`, default: `500`
- context: `object`, default: `{}`

Example:

```js
const { HttpError } = require('@terrajs/mono')

throw new HttpError('file-not-found', 404, { path: '/tmp/my-file.txt' })
```

### conf

> Your project configuration defined in `conf/`

### log

> Log instance

```js
// Write on stdout
log.verbose('This is a verbose message')
log.debug('This is a debug message')
log.info('This is an information message')
log.warn('Warning, this feature will be removed soon')

// Write on stderr
log.error('An error appened')

// Profiling
log.profile('test')
setTimeout(() => log.profile('test'), 1000)
```

### imperium

> [Imperium](https://github.com/terrajs/imperium) instance, use it to define ACL of your app

### jwt

> JWT utils to create and decode a token

```js
jwt.generateJWT(session: object): Promise<string>
```

  `session` must be an `object` with an `userId` property, you can use [jwt conf](#jwt-1) to customize the token behaviour (expiration, secret key).

  Example:

  ```js
  const token = await jwt.generateJWT({ userId: 1, username: 'TerraJS' })
  ```

```js
jwt.loadSession(req, [getToken: function]): Promise<object>
```

  `req` must be the Express request. `getToken` is optionnal, if defined it will be called with `req` and should return the `token` to decode.
  
  Example:
  
  ```js
  const session = await jwt.loadSession(req)
  ```

## Utils

Mono is shipped with useful utils:

```js
const { ok, cb, waitFor, ... } = require('@terrajs/mono/utils')
```

Waits for the value of promise. If promise throws an Error, returns undefined.

```js
ok(promise: Object): Promise
```

Calls a function fn that takes arguments args and an (err, result) callback. Waits for the callback result, throwing an Error if err is truthy.

```js
cb(fn: Function, ...args: any[]): Promise
```

Waits for `ms` milliseconds to pass, use `setTimeout` under the hood.

```js
waitFor(ms: number): Promise
```

Waits for emitter to emit an eventName event.

```js
waitForEvent(emitter: EventEmitter, eventName: string, timeout: number = -1): Promise<Array>
```
Waits for all Promises in the keys of obj to resolve.

```js
asyncObject(obj: Object): Promise<Object>
```

We developped other utils that you might find useful:
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
- [jwt](#jwt-1)
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
