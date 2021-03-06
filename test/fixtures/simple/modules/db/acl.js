const { imperium } = require('../../../../../')

imperium.role('user', (req) => {
	return { user: String(req.session.userId) }
})

imperium.role('admin', (req) => {
	return !!req.session.admin
})

// Set actions
imperium.role('user')
	.can('seeUser', { user: '@' })
	.can('knowBatman', { user: 'batman' })

imperium.role('admin')
	.is('user', { user: '*' })
