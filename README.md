<h1 align="center"><img src="https://user-images.githubusercontent.com/904724/29137684-70c284aa-7d41-11e7-8362-031a7866dbf2.png" width="300" alt="Mono"/></h1>

> Mono is a REST API Framework for node.js (with TypeScript support)

## Installation

```bash
npm install --save @terrajs/mono
```

## Features

- Configuration based on environment
- Easy API Versionning (`v1`, `v2`...)
- Sessions with [Json Web Token](https://jwt.io)
- ACL with [imperium](https://github.com/benjamincanac/imperium)
- Routes validation with [joi](https://github.com/hapijs/joi)
- Init modules via `modules/**/*.init.js`
- Routes declaration via `modules/**/*.routes.js`

## Usage

```
conf/
  application.js
  development.js
modules/
  users/
    users.init.js
    users.routes.js
server.js
package.json
```

`server.js`
```js
const start = require('@terrajs/mono').default

start()
```

With [TypeScript](https://github.com/Microsoft/TypeScript):
```ts
import start from '@terrajs/mono'
```

## Configuration

You project configuration should be inside the `conf/` directory.

Mono will load and merge these files in this order:

1. `conf/application.js`
2. `conf/${process.env.NODE_ENV}.js`
3. `conf/local.js` (should be inside `.gitignore`)

All these files should export an `Object`, to configure Mono, use the `mono` property.

`mono` available properties:

- `http`: HTTP configuration of Mono server
- `jwt`: Json Web Token configuration
- `log`: Log configuration
- `modules`: External modules to use with Mono

## Getters

```js
const { conf, log, acl, HttpError, db, es } = require('@terrajs/mono')
```

## Utils

```js
const { ok, cb, waitFor, waitForEvent, asyncObject } = require('@terrajs/mono/utils')
```
