const bunyan = require('bunyan')
const logger = bunyan.createLogger({name: 'Stations'})
const api = require('./api')

let stations = null

api('metadata/stations')
	.then(data => data.match(/<html>/gi) ? Promise.reject('Response is html') : data)
	.then(data => JSON.parse(data))
	.then(value => {logger.info(`stations ${value}`); return value})
	.then(stationsData => stations = stationsData)


module.exports = {
	getStationDetails: function(code) {
		let {latitude, longitude, stationName: name} = stations.filter(station => station.stationShortCode === code)[0]
		return {code, name, latitude, longitude}
	}
}