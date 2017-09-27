const { imperium } = require('../../../../')

imperium.role('admin', (req) => {
	return !!req.session.admin
})

imperium.role('user', (req) => {
	return { user: req.session.userId }
})

imperium
	.role('user')
	.can('seeUser', { user: '@' })
	.can('manageUser', { user: '@' })

imperium
	.role('admin')
	.is('user', { user: '*' })
