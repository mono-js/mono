# Http

Mono uses Express to create an HTTP server.

To help with security, it integrates by default [helmet](https://github.com/helmetjs/helmet).

## Configuration

> Mono HTTP configuration in `conf.mono.http`

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


## Utils

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
