# Sessions

Mono integrates the [Json Web Tokens](http://jwt.io/) standard in its core. So you can easily add any users & session management in your Web API.

## Usage

We strongly recommend to use the `session` property inside your [routes](/routes) declarations every time your need user access.

### Simpliest example

`src/sessions/sessions.routes.js`:

```js
const { jwt } = require('mono-core')

module.exports = [
  {
    method: 'POST',
    path: '/session',
    async handler(req, res) {
      const token = await jwt.generateJWT(req.body)

      res.json({ token })
    }
  },
  {
    method: 'GET',
    path: '/session',
    session: true,
    handler(req, res) {
      // Will run only if a valid JWT is given in the Authorization header
      res.json(req.session)
    }
  }
]
```

Then, when running `mono`, we can play with `curl`:

```bash
# Create a session
curl -H "Content-Type: application/json" -X POST -d '{"userId": 1, "username":"mono-js"}' http://localhost:8000/session
{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoidGVycmFqcyIsImlhdCI6MTUyMDE5NjY1NCwiZXhwIjoxNTIwODAxNDU0fQ.NE892nefSP84A0-UxT_6TBu6vf1m7oP-K7Zsqd-XYb0"}
```

```bash
# [FAIL] Get session without JWT
curl -i http://localhost:8000/session
HTTP/1.1 401 Unauthorized
{"code":"credentials-required","status":401,"context":{}}
```

```bash
# Get session with JWT header
curl -i -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEs...' http://localhost:8000/session
HTTP/1.1 200 OK
{"userId":1,"username":"mono-js","iat":1520196654,"exp":1520801454}
```

## Methods

Mono offers a set of methods to create & decode JWT easily.

### jwt.generateJWT

```js
const { jwt } = require('mono-core')

jwt.generateJWT(session: object): Promise<string>
```

**`session` must be an `object` with an `userId` property**.

You can use [jwt conf](/sessions?id=configuration) to customize the token behaviour (expiration, secret key).

#### Example:

```js
const { jwt } = require('mono-core')

const token = await jwt.generateJWT({ userId: 1, username: 'mono-js' })
```

### jwt.loadSession

> This method is used internally intbyo Mono when you define `session: true` or `session: 'optional'` in your route declarations.

```js
const { jwt } = require('mono-core')

jwt.loadSession(req, [getJWT: function]): Promise<object>
```

`req` must be the Express request. `getJWT` is optionnal, if defined it will be called with `req` and should return the `token` to decode.

#### Example:

```js
const { jwt } = require('mono-core')

const session = await jwt.loadSession(req)
```

## Configuration

> Mono JWT configuration

### `conf.mono.jwt`

  - Type: `object`
  - Default: `{}`

  ### `secret`

    Secret key to encode the JWT.

    - Type: `string`
    - Default: `'secret'`

  ### `headerKey`

    HTTP header key to look for the JWT.

    - Type: `string`
    - Default: `'Authorization'`

  ### `options`

    JWT options given to [jwt.sign](https://github.com/auth0/node-jsonwebtoken#usage).

    - Type: `object`
    - Default: `{}`

      ### `expiresIn`

        - Type: `number` or `string`
        - Default: `'7d'`

      ### `...`

      _See the full list of options on https://github.com/auth0/node-jsonwebtoken#usage_

### Example

You can customize these settings in `conf/application.js` for example:

```js
module.exports = {
  mono: {
    jwt: {
      secret: 'my-super-secret-key',
      options: {
        algorithm: 'HS384'
        expiresIn: '1 month'
      }
    }
  }
}
```
