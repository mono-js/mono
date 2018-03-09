# Use programmatically

Mono can be used programmatically, it's really useful when integrating it with tools like [PM2](https://github.com/Unitech/pm2), [New Relic](https://github.com/newrelic/node-newrelic) and more.

Let's see what mono `exposes` as default:

```js
const mono = require('@terrajs/mono')
```

Definition:

```js
mono(dir?: string): Promise<context>
```

> `dir` is optional, it's where you want mono to start, it will look from `<dir>/conf/`, `<dir>/src/` and `<dir>/package.json`.

The context is an `object` with some useful properties:

- `server`: The node.js server created
- `app`: The Express.js app instance
- `conf`: Application configuration object, see [configuration](/configuration)
- `log`: Log instance, see [logging](/logging)
- `hook`: Mono hook instance, see [hooks](/hooks)

Example `server.js`:

```js
const mono = require('@terrajs/mono')

mono(__dirname)
  .then((context) => {
    console.log('Mono ready!')
  })
  .catch((err) => {
    console.error(err)
  })
```

Then you can run Mono by running `node server.js`.
