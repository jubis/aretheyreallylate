const bunyan = require('bunyan')
const logger = bunyan.createLogger({name: 'Trains'})

module.exports = {
	getStationDetails: function(code) {
		logger.warn('Stations.getStationDetails is not implemented')
		return code
	}
}