# ACL

Most of the time, a REST API needs to protect resources by authentification access. Furthermore, some resources require to be protected from specific users, for example, admin routes.

ACL are quite complicated to setup, and most of librairies do not meet specific needs of REST APIs. That's why we developed [Imperium](https://github.com/terrajs/imperium), which is quite generic and answer all of our needs. Imperium is fully integrated within Mono and provide users with powerful acls.

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

You can find the full documentation of Imperium [here](https://github.com/terrajs/imperium).
