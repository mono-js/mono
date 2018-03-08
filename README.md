<h1 align="center"><img src="https://user-images.githubusercontent.com/904724/30934843-1ffda8d8-a3cf-11e7-9c01-dd043e31e89b.png" width="350" alt="Mono"/></h1>

> Mono is an opinionated REST API Framework for Node.js based on Express.js

[![npm version](https://img.shields.io/npm/v/@terrajs/mono.svg)](https://www.npmjs.com/package/@terrajs/mono)
[![Travis](https://img.shields.io/travis/terrajs/mono/master.svg)](https://travis-ci.org/terrajs/mono)
[![Coverage](https://img.shields.io/codecov/c/github/terrajs/mono/master.svg)](https://codecov.io/gh/terrajs/mono)
[![license](https://img.shields.io/github/license/terrajs/mono.svg)](https://github.com/terrajs/mono/blob/master/LICENSE.md)

## Features

- Environment based config
- API Versionning (`v1`, `v2`...)
- [Json Web Token](https://jwt.io) sessions
- ACL with [Imperium](https://github.com/terrajs/imperium)
- Routes validation with [joi](https://github.com/hapijs/joi)
- Init files via `src/**/*.init.js`
- Routes declaration via `src/**/*.routes.js`
- Extendable with modules & hooks

## Usage

**INFO:** You need `node` >= `8.0.0` to use Mono since it uses native `async/await`

### Installation

You can boostrap a Mono project by using our official [create-mono-app](https://github.com/terrajs/create-mono-app):

```bash
npx create-mono-app my-app
```

### Start in development

```bash
npm run dev
```

### Start in production

```bash
NODE_ENV=production npm start
```

### Run the tests with coverage

```bash
npm test
```

## Official Modules

Mono offers a module system to plug any functionality in your project:

- [mono-mongodb](https://github.com/terrajs/mono-mongodb)
- [mono-elasticsearch](https://github.com/terrajs/mono-elasticsearch)
- [mono-redis](https://github.com/terrajs/mono-redis)
- [mono-io](https://github.com/terrajs/mono-io)
- [mono-push](https://github.com/terrajs/mono-push)
- [mono-mail](https://github.com/terrajs/mono-mail)
- [mono-notifications](https://github.com/terrajs/mono-notifications)
- [mono-doc](https://github.com/terrajs/mono-doc)

## Credits

Logo created by Frederick Allen from the Noun Project.

## License

MIT &copy; [terrajs](https://github.com/terrajs)
