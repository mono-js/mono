import { log, conf, HttpError, acl } from '../../../../../src'

import { ok } from '../../../../../src/utils'

log.module('users').info('teub')

export default () => {
	console.log('Init test')
}
