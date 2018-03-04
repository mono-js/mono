# Init Files

Mono will load automatically every init files of your application in `src/**/*.init.js`.

Init files are loaded before every other ones and listening the server. These are really useful to ensure any Database/API checks that you need to do before running your application.

Those files should export a `function` which will receive a `context` object with the following properties:

- `log`: Log instance prefixed with the file name, see [logging](/logging)
- `conf`: The project configuration, see [configuration](/configuration)
- `server`: The Node server
- `app`: The Express app
- `hook`: Hook instance, see [hooks](/hooks).

> If the exported function returns a `Promise` (or be `async`), Mono will wait for it to finish before going to the next init file.

Example of adding CORS to the app:

```js
// src/cors.init.js
const cors = require('cors')

module.exports = function ({ app }) {
  // Add CORS to the whole app
  app.use(cors())
}
```

Another example of ensuring MongoDB indexes on startup (asynchronous):

```js
// src/users/users.init.js
const { db } = require('mono-mongodb')

module.exports = async ({ log }) => {
  const usersCollection = db.collection('users')

  log.info('Ensuring users unique email index')
  await usersCollection.createIndex({ email: 1 }, { unique: true })
}
```
