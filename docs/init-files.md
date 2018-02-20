# Init Files

Mono will load automatically every init files of your application in `src/**/*.init.js`.

Init files are loaded before every other ones. Those files have access to properties:

```js
module.exports = function ({ log, conf, appDir, server, app }) {
}
```
