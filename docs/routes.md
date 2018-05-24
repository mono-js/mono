# Routes

In order to define the routes of your API, you simply need to create a `.routes.js` file.

Mono will load automatically every routes files of your application in `src/**/*.routes.js` to create valid Express routes.

A route file **needs to export an array of objects** with specific keys.

Here is an example of a basic route (`src/hello.routes.js`):

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

* `method` **(required)**<br>
  The HTTP verb of the route, can be one of the following: `GET`, `POST`, `PUT`, `DELETE`, etc. It can be specified in uppercase or lowercase. _It could also be an array of methods to create multiple routes._

* `path`**(required)**<br>
  The path of the url to match the route. Mono being based on Express 4.x, you can find the full documentation [here](http://expressjs.com/en/guide/routing.html).

* `handler`**(required)**<br>
  The function that will handle the request. Mono uses native `async`/`await` so you can use it directly. It could also be an array of middlewares. You can find the full documentation of Express on middleware functions [here](http://expressjs.com/en/guide/writing-middleware.html).

* `version`<br>
  The version used to prefix the route, like `v1`, `v2`, ... or `*` (default) to match all.

* `validation` _(alias: `validate`)_<br>
  Takes a [joi](https://github.com/hapijs/joi) object and uses [express-validation](https://github.com/andrewkeig/express-validation).

* `session`<br>
  Can be set to `true`, `false` or `'optionnal'` (to populate the `req.session` without throwing an error). See documentation [here](sessions.md).

* `getJWT`<br>
  Customize where to fetch the token inside the request (default to the `Authorization` header), has to be used with the `session` key. It's useful when you want to give a token by email to log-in the user to your app.

* `is`<br>
  Secures a route by checking user's role. Must be a string or an array of string. Force `session` to `true` when defined. See documentation [here](acl.md).

* `can`<br>
  Secures a route by checking user's actions. Must be an action or an array of action. Force `session` to `true`. See documentation [here](acl.md).

* `env`<br>
  Node environment (`NODE_ENV`) where the route should be defined (default to `'*'`). Useful to add routes for development and testing purpose.

* `documentation` _(alias: `doc`)_<br>
  Object to describe the route in order to be displayed in [mono-doc](https://github.com/mono-js/mono-doc). See documentation [here](documentation.md).

Example with `async`/`await`:

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
  },
  {
    method: 'POST',
    path: '/hello',
    handler: [
      checkUser,
      async (req, res) => {
        res.json({ hello: 'world' })
      }
    ]
  }
]
```

Example with version, validation and documentation:

```js
const controller = require('./auth.controller')

module.exports = [
  {
    method: 'GET',
    path: '/auth/callback',
    handler: controller.authenticate,
    version: 'v1', // Will be accessible only at /v1/auth/callback
    validation: {
      // Validate query parameters
      query: Joi.object().keys({
        code: Joi.string().required(),
        host: Joi.string().required()
      })
    },
    documentation: {
      name: 'Github Callback',
      description: 'Auth url to get user token'
    }
  }
]
```

See example with `can` and `is` [here](/acl?id=middleware).

## Built-in routes

Mono also has some built-in routes:

* `/_` => Returns the informations of your app stored in conf: `name`, `version` and `env`
* `/_ping` => Returns `'pong'` with a `200` status code
