# Configuration

Every REST API needs to have environment-based configuration in order to be deployed on different infrastructures.

That's why Mono handles it for you with it's built-in configuration system.

## Utilisation

You can use `conf` anywhere in your code. You just have to require `mono`:

```js
const { conf } = require('@terrajs/mono')
```

## Structure

By default, Mono will look in the `conf/` directory. This setting can be override with the `MONO_CONF_PATH` environment variable.

A basic conf folder in Mono looks like:

```
conf/
├── application.js
├── development.js
├── production.js
├── test.js
└── local.js
```

Mono uses a merge recursive strategy to generate your conf.

## Inheritance

Mono will load and merge these files in this order:

```js
conf/application.js
conf/${process.env.NODE_ENV}.js
conf/local.js (should be inside .gitignore)
```

All these files should export an `Object`, to configure Mono, use the `mono` property.

Firstly, it will load the `application.js` which should contain the global conf of your app.

Then, it will load file matching your current env `development.js`, `staging.js`, `production.js`, `test.js`, ... You are free to name your conf files according to your own environment names. This file should contain environment-based conf of your app like databases urls, log levels, ...

And last but not least, it will load only if it exists the optional `local.js` file, which is really useful when you're multiple developers working on the same API. Our advice is to add this file in your `.gitignore`. It allows every developer to have their own specific conf but also to keep private conf like api and secret keys out of git.

The conf object will automatically be populated with some vars so you can access those directly in your code.

So at the end `local.js` will be merged in the environment conf file like `development.js` which will be merged in `application.js`.

This merge results in a conf object including some useful keys:

```js
{
  env: process.env.NODE_ENV || 'development',
  name: pkg.name,
  version: pkg.version
}
```

## Mono

Mono uses a `mono` key in your conf which is by default in `application.js`:

```js
module.exports = {
	mono: {
		modules: ['mono-mongodb'],
		http: {
			port: 8000
		},
		log: {
			level: 'verbose'
		}
	}
}
```

So, `application.js` is used for global conf, as mentioned above, you should use environment-based files for specific conf like `development.js`:

```js
module.exports = {
	mono: {
		mongodb: {
			url: 'mongodb://localhost:27017/my-mono-app'
		}
	}
}
```

Those examples show configurations files using the [mono-mongodb](https://github.com/terrajs/mono-mongodb) module.

Here is the documentation for the configuration of the different features:

* [Http](/http?id=configuration)
* [Logging](/logging?id=configuration)
* [Sessions](/sessions?id=configuration)
* [Modules](/modules?id=configuration)
