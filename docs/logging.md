# Logging

Since logs are a must-have for a REST API, Mono integrates logging thanks to [winston](https://github.com/winstonjs/winston).

You can use `log` anywhere in your code. You just have to require `mono`:

```js
const { log } = require('@terrajs/mono')

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
