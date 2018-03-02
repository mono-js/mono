# Sessions

Mono integrates the [Json Web Tokens](http://jwt.io/) standard in its core. So you can easily add any users & session management in your API.

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

## Example

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

## Utils

Mono offers a set of utils to create & decode JWT easily.

### jwt.generateJWT

```js
const { jwt } = require('@terrajs/mono')

jwt.generateJWT(session: object): Promise<string>
```

**`session` must be an `object` with an `userId` property**.

You can use [jwt conf](/sessions?id=configuration) to customize the token behaviour (expiration, secret key).

#### Example:

```js
const { jwt } = require('@terrajs/mono')

const token = await jwt.generateJWT({ userId: 1, username: 'TerraJS' })
```

### jwt.loadSession

```js
const { jwt } = require('@terrajs/mono')

jwt.loadSession(req, [getJWT: function]): Promise<object>
```

`req` must be the Express request. `getJWT` is optionnal, if defined it will be called with `req` and should return the `token` to decode.

#### Example:

```js
const { jwt } = require('@terrajs/mono')

const session = await jwt.loadSession(req)
```
