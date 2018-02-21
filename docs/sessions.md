# Sessions

## Configuration

> Mono JWT configuration in `conf.mono.jwt`

- Type: `object`
- Default: `{}`

  ### secret

  > Secret key to encode the JWT.

  - Type: `string`
  - Default: `'secret'`

  ### expiresIn

  > JWT expiration time, option given directly to [jwt.sign](https://github.com/auth0/node-jsonwebtoken#usage).

  - Type: `number` or `string`
  - Default: `'7d'`

  ### headerKey

  > HTTP header key to look for the JWT.

  - Type: `string`
  - Default: `'Authorization'`

## Utils

> JWT utils to create and decode a token

```js
const { jwt } = require('@terrajs/mono')

jwt.generateJWT(session: object): Promise<string>
```

`session` must be an `object` with an `userId` property, you can use [jwt conf](#jwt-1) to customize the token behaviour (expiration, secret key).

Example:

```js
const { jwt } = require('@terrajs/mono')

const token = await jwt.generateJWT({ userId: 1, username: 'TerraJS' })
```

```js
const { jwt } = require('@terrajs/mono')

jwt.loadSession(req, [getToken: function]): Promise<object>
```

`req` must be the Express request. `getToken` is optionnal, if defined it will be called with `req` and should return the `token` to decode.

Example:

```js
const { jwt } = require('@terrajs/mono')

const session = await jwt.loadSession(req)
```
