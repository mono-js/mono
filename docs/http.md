# Http

Mono uses Express to create an HTTP server.

To help with security, it integrates by default [helmet](https://github.com/helmetjs/helmet).

## HttpError

Custom error class (extends `Error`), used by Mono for API errors with status code and context.

```js
const { HttpError } = require('@terrajs/mono') // Optional, Mono sets global.HttpError

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

### Routes errors

Mono will catch any `HttpError` throws in any [route handler](/routes).

Example (`src/fail.routes.js`):

```js
module.exports = [
  {
    method: 'GET',
    path: '/awesome-feature',
    handler(req, res) {
      throw new HttpError('not-implemented', 501, { message: 'Coming soon!' })
    }
  }
]
```

Then, by running `curl`:

```bash
curl -i http://localhost:8000/awesome-feature

HTTP/1.1 501 Not Implemented
Content-Type: application/json; charset=utf-8
Content-Length: 76
# Other headers...

{"code":"not-implemented","status":501,"context":{"message":"Coming soon!"}}
```

## Configuration

> Mono HTTP configuration

### `conf.mono.http`

  - Type: `object`
  - Default: `{}`

  ### `logLevel`

    > Log level/format for the HTTP requests, the value will be given to [morgan](https://github.com/expressjs/morgan) middleware. If `false`, no HTTP log will be made.

    - Type: `string` or `false`
    - Default: `'dev'` in development and `'combined'` in production

  ### `port`

    > Port number where the HTTP server will listen, can be overwriten by `PORT` environment variable.

    - Type: `number`
    - Default: `8000`

  ### `preventListen`

    > Prevent server to listen (useful to make some scripts based on your services).

    - Type: `boolean`
    - Default: `false`
