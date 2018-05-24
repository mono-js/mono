# Logging

Logs are a must-have for any Web API. Mono integrates logging thanks to [winston](https://github.com/winstonjs/winston).

## Usage

You can use `log` anywhere in your code. You just have to require `mono`:

```js
const { log } = require('mono-core')

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

## Configuration

> Mono logs configuration

### `conf.mono.log`

  - Type: `object`
  - Default: `{}`

  ### `level`

    > Log level to write, can be overwritten by `MONO_LOG_LEVEL` environment variable.

    - Type: `string`
    - Default: `'verbose'`
    - Available values: `'verbose'`, `'debug'`, `'info'`, `'warn'` or `'error'`

  ### `console`

    > Write logs in the console (stdout and stderr).

    - Type: `boolean`
    - Default: `true`

  ### `files`

    > Write logs in file(s).

    - Type: `array`
    - Default: `[]`

    Properties:
      - filename: `string`, **required**, path to log file.
      - level: `string`, *optional*, default to `log.level`, log level to write in file.
      - See [winston file transport](https://github.com/winstonjs/winston/blob/master/docs/transports.md#file-transport) for the full list of properties

  ### `http`

    > Stream logs to an http endpoint.

    - Type: `array`
    - Default: `[]`

    Properties:
    - level: `string`, *optional*, default to `log.level`, log level to write in file.
    - See [winston http transport](https://github.com/winstonjs/winston/blob/master/docs/transports.md#http-transport) for the full list of properties

  ### `transports`

    > Use custom Winton tranporter to send logs to.

    - Type: `array`
    - Default: `[]`

    See [winston custom transport](https://github.com/winstonjs/winston/blob/master/docs/transports.md#winston-more) for the full list of properties
