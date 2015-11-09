'use strict'

function trainsData(triggerS) {
	return triggerS
		.map(() => `/trainStatus`)
		.map(path => {
			return {type: 'GET', url: path}
		})
		.ajax()
}