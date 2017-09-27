<h1 align="center"><img src="https://user-images.githubusercontent.com/904724/30934843-1ffda8d8-a3cf-11e7-9c01-dd043e31e89b.png" width="350" alt="Mono"/></h1>

> Mono is a REST API Framework for node.js

[![npm version](https://img.shields.io/npm/v/@terrajs/mono.svg)](https://www.npmjs.com/package/@terrajs/mono)
[![Travis](https://img.shields.io/travis/terrajs/mono/master.svg)](https://travis-ci.org/terrajs/mono)
[![Coverage](https://img.shields.io/codecov/c/github/terrajs/mono/master.svg)](https://codecov.io/gh/terrajs/mono)
[![license](https://img.shields.io/github/license/terrajs/mono.svg)](https://github.com/terrajs/mono/blob/master/LICENSE.md)

## Installation

```bash
npm install --save @terrajs/mono
```

## Features

- Configuration based on environment
- Easy API Versionning (`v1`, `v2`...)
- Sessions with [Json Web Token](https://jwt.io)
- ACL with [imperium](https://github.com/terrajs/imperium)
- Routes validation with [joi](https://github.com/hapijs/joi)
- Init modules via `modules/**/*.init.js`
- Routes declaration via `modules/**/*.routes.js`

## Usage

**INFO:** You need `node` >= `8.0.0` to use Mono since it make the use of `async/await`

```
conf/
  application.js
  development.js
src/
  users/
    users.init.js
    users.routes.js
package.json
```

`package.json`

```json
{
  "scripts": {
    "dev": "mono dev",
    "start": "mono"
  }
}
```

## Configuration

You project configuration should be inside the `conf/` directory.

Mono will load and merge these files in this order:

1. `conf/application.js`
2. `conf/${process.env.NODE_ENV}.js`
3. `conf/local.js` (should be inside `.gitignore`)

All these files should export an `Object`, to configure Mono, use the `mono` property.

`mono` available properties:

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| modules | `Array` | `[]` | External modules to use with Mono, see for example [mono-mongodb](https://github.com/terrajs/mono-mongodb). |
| http | `Object` | `{}` | HTTP configuration of Mono server. |
| http.logLevel | `String` or `false` | `'dev'` | Log level/format for the HTTP requests, the value will be given to [morgan](https://github.com/expressjs/morgan) middleware. If `false`, no HTTP log will be made. |
| http.port | `Number` | `5000` | Port number where the HTTP server will listen, can be overwriten by `PORT` environment variable. |
| http.host | `String` | `'localhost'` | Hostname to listen, can be overwriten by `HOST` environment variable. |
| jwt | `Object` | `{}` | Json Web Token configuration. |
| jwt.secret | `String` | `'secret'` | Secret key to encode the JWT. |
| jwt.expiresIn | `Number` or `String` | `'7d'` | JWT expiration time, opton given directly to [jwt.sign](https://github.com/auth0/node-jsonwebtoken#usage). |
| jwt.headerKey | `String` | `'Authorization'` | HTTP header key to look for the JWT. |
| log | `Object` | `{}` | Log configuration, it uses [winston](https://github.com/winstonjs/winston) under the hood. |
| log.level | `String` | `'verbose'` | Log level to write, can be overwritten by `MONO_LOG_LEVEL` environment variable. |
| log.console | `Boolean` | `true` | Write log in the console (stdout and stderr). |
| log.files | `Array` | `[]` | Configurations to write logs on file(s). |
| log.files[].filename | `String` | *Required* | Path to log file. |
| log.files[].level | `String` | `log.level` | Log level to write into the file. |
| log.files[].maxsize | `Number` | `See winston File transporter` | Max filesize before creating a new one. |
| log.files[].maxFiles | `Number` | `See winston File transporter` | Maximum number of files to create. |

## Getters

```js
const { conf, log, imperium, jwt, HttpError } = require('@terrajs/mono')
```

## Utils

```js
const { ok, cb, waitFor, ... } = require('@terrajs/mono/utils')
```

Methods:
- `ok(promise: Object): Promise`
- `cb(fn: Function, ...args: any[]): Promise`
- `waitFor(ms: number): Promise`
- `waitForEvent(emitter: EventEmitter, eventName: string): Promise<Array>`
- `asyncObject(obj: Object): Promise<Object>`

## Credits

Logo created by Frederick Allen from the Noun Project.
