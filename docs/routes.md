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

Mono has some built-in routes:

* `/_` => Returns the name of your app stored in `conf.name` and populated by Mono from your `package.json`
* `/_ping` => Returns 'pong'
* `/_env` => Returns the current environnement
* `/_version` => Returns the version of your app stored in `conf.version` and populated by Mono from your `package.json`
* `/_routes` => Returns an array of all the routes of your API (useful for [api documentation](mono-doc.md))
