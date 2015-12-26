'use strict'

function toApiCall($url) {
	return $url
		.map(path => {
			return {type: 'GET', url: path}
		})
		.ajax()
}

module.exports = {
	trainsData: function(triggerS) {
		return toApiCall(
			triggerS.map(() => `/trainStatus`)
		)

	},
	singleTrainData: function(trainNumber) {
		return toApiCall(
			Bacon.once(`/train/${trainNumber}`)
		)

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