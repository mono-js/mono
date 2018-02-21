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

## Declaration

* `method` **(required)**: The HTTP VERB of the route, can be one of the following: `GET`, `POST`, `PUT`, `DELETE`, ... It can be specified in uppercase or lowercase. It could also be an array of methods to create multiple routes.
* `path`**(required)**: The path of the url to match the route. Mono being based on Express 4.x, you can find the full documentation [here](http://expressjs.com/en/guide/routing.html).
* `handler`**(required)**: The function that will handle this request. Mono uses native async/await so you can use it directly. It could also be an array of middlewares. You can find the full documentation of Express on middleware functions [here](http://expressjs.com/en/guide/writing-middleware.html).
* `version`:
* `validation`: (alias `validate`)
* `session`: See documentation [here](sessions.md).
* `is`: See ACL documentation [here](acl.md).
* `can`: See ACL documentation [here](acl.md).
* `documentation`: (alias `doc`) Used [here](documentation.md).

Example with async await:

```js
module.exports = [
  {
    method: ['GET', 'POST'],
    path: '/hello',
    async handler(req, res) {
      const result = await MyService.getResult()

      res.json(result)
    }
  }
]
```

Example with multiple middlewares:

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

## Built-in routes

Mono also has some built-in routes:

* `/_` => Returns the informations of your app stored in conf: `name`, `version` and `env`
* `/_ping` => Returns 'pong'
* `/_routes` => Returns an array of all the routes of your API (useful for [api documentation](mono-doc.md))
