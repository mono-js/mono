# Routes

In order to define the routes of your REST API application, you just need to create `.routes.js` files.

Mono will load automatically every routes files of your application in `src/**/*.routes.js` to create valid Express routes.

A route file needs to export an array of objects with specific keys. Here is an example of a basic route:

```js
module.exports = [
	{
		method: 'GET',
		path: '/hello',
		handler(req, res) {
			res.json({ hello: 'world' })
		}
	}
]
```

## Configuration

### method

Method represents the HTTP VERB of your route, can be one of the following: `GET`, `POST`, `PUT`, `DELETE`, ...

It can be specified in uppercase or lowercase.

It can also take an array of HTTP VERBS in order to create multipe routes:

```js
module.exports = [
	{
		method: ['GET', 'POST'],
		path: '/hello',
		handler(req, res) {
			res.json({ hello: 'world' })
		}
	}
]
```

### path

Route paths define the endpoints at which requests can be made. Route paths can be strings, string patterns, or regular expressions.

Mono being based on Express 4.x, you can find the full documentation [here](http://expressjs.com/en/guide/routing.html).

### handler

Handler represents the middleware of your route.

Mono uses native async/await so you can use it directly:

```js
module.exports = [
  {
    method: 'GET',
    path: '/hello',
    async handler(req, res) {
      const result = await MyService.getResult()

      res.json(result)
    }
  }
]
```

You can also pass an Array to the handler key:

```js
const { checkUser, sayHello } = require('./hello.controller.js')

module.exports = [
  {
    method: 'GET',
    path: '/hello',
    handler: [
      checkUser,
      sayHello
    ]
  }
]
```

You can find the full documentation on middleware function [here](http://expressjs.com/en/guide/writing-middleware.html).

## Built-in routes

Mono also has some built-in routes:

* `/_` => Returns the name of your app stored in `conf.name` and populated by Mono from your `package.json`
* `/_ping` => Returns 'pong'
* `/_env` => Returns the current environnement
* `/_version` => Returns the version of your app stored in `conf.version` and populated by Mono from your `package.json`
* `/_routes` => Returns an array of all the routes of your API (useful for [api documentation](mono-doc.md))
