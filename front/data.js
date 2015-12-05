'use strict'

module.exports = {
	trainsData: function(triggerS) {
		return triggerS
			.map(() => `/trainStatus`)
			.map(path => {
				return {type: 'GET', url: path}
			})
			.ajax()
	},
	createAction: function(initial) {
		const bus = new Bacon.Bus()

		if(typeof initial !== 'undefined') {
			console.log('initial', initial)
			bus.push(initial)
		}

		return {
			$: bus,
			action: function(arg1) {
				bus.push(arg1)
			}
		}
	}
}