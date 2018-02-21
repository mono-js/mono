# ACL

Most of the time, a REST API needs to protect resources by authentification access. Furthermore, some resources require to be protected from specific users, for example, admin routes.

ACL are quite complicated to setup, and most of librairies do not meet specific needs of REST APIs. That's why we developed [Imperium](https://github.com/terrajs/imperium), which is quite generic and answer all of our needs. Imperium is fully integrated within Mono and provide users with powerful acls.

## Usage

You can use `imperium` anywhere in your code. You just have to require `mono`:

```js
const { imperium } = require('@terrajs/mono')
```

However, in order to simplify even more the work of developers, we created `.acl.js` files.

Mono will load automatically every acl files of your application in `src/**/*.acl.js`.

Here is a basic example of an acl file:

```js
const { imperium } = require('@terrajs/mono')

imperium.role('admin', (req) => !!req.session.admin)
imperium.role('user', async (req) => {
  return { user: req.session.userId }
})
```

## Roles

Define the different roles of your applications.

Use `imperium.role('...', (req) => {})` to create a role.

The function will be used to determine if your user has the role (it can be `asynchronous` by returning a `Promise`).

For example, you can get your user in MongoDB and return:
- a `Boolean` (`true` if user has the corresponding role, otherwise `false`)
- an `Object` to compare against route actions

```js
imperium.role('admin', async (req) => {
	return req.session.role === 'admin'
})

imperium.role('user', async (req) => {
	return { user: req.session.userId }
})
```

When returning an `object`, the keys will be compared against user actions params.

## Actions

Use `imperium.role('...')` to get a role, and use `can` or `is` methods to give actions or inheritance from another role.

### `can(actionName, [params])`

Define a user action with its params to match against.

```js
imperium.role('user')
	.can('seeUser', { user: '@' })
	.can('manageUser', { user: '@' }) // '@' means itself
```

### `is(roleName, [params])`

Inherit role's actions and overwrite its params.

```js
imperium.role('admin')
	.is('user', { user: '*' }) // '*' means all, so admin can see and manage all users
```

## Middleware

You can use Imperium middlewares (`can` / `is`) in your Mono routes. See the documentation [here](/routes?id=declaration).

### `can(actions)`

Secure a route by checking user's actions.

`actions` should be an `action` or an `array` of `action`, giving an array will act as an `AND` operator.

An `action` should look like this:
- `action`: `string`, the user action, defined in the user role
- `[key]`: `string`, expression to be matched against user's ACL

If you give a `string` as action, it will be transformed to the `action` schema (ex: `'seeUser'` -> `{ action: 'seeUser' }`)

The keys other than `action`, will be interpolated from `req.params`, `req.query` and `req.body`.

Example:

```js
module.exports = [
  // Verify that connected user can see all users
  // By omiting the `user` property, it will be defaulted as `user`: '*'
  {
    method: 'GET',
    path: '/users',
    handler: ...,
    can: 'seeUser'
  },
  // Verify that connected user can see AND manage all users
  {
    method: 'GET',
    path: '/users',
    handler: ...,
    can: ['seeUser', 'manageUser']
  },
  // Only connected user can see itself or admin
  // Ex: /users/23 will check the user ACL to be { user: '23' }
  {
    method: 'GET',
    path: '/users/:userId',
    handler: ...,
    can: { action: 'seeUser', user: ':userId' }
  },
  {
    method: 'PUT',
    path: '/users/:userId',
    handler: ...,
    can: [{ action: 'manageUser', user: ':userId' }]
  }
]
```

### `is(roles)`

Secure a route by checking user's role.

`roles` should be an `string` or an `array` of `string`, giving an array will act as and `OR` operator.

Example:

```js
module.exports = [
  // Only an admin will be able to call this route
  {
    method: 'GET',
    path: '/users',
    handler: ...,
    is: 'admin'
  },
  // Only an admin OR user will be able to call this route
  {
    method: 'GET',
    path: '/users',
    handler: ...,
    is: ['admin', 'user']
  }
]
```

You can find the full documentation of Imperium [here](https://github.com/terrajs/imperium).
