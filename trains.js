let Promise = require('bluebird')
let request = require('request')
let moment = require('moment')

Promise.promisifyAll(request)

let apiHost = 'rata.digitraffic.fi'
let apiUriBase = '/api/v1/'
let requestBase = `http://${apiHost}${apiUriBase}`

module.exports = {
	trainInfoFor: (trainNumber) => {
		return request.getAsync(`${requestBase}/live-trains/${trainNumber}`)
			.then((response) => {
				let data = response[0].body
				let trainData = JSON.parse(data)[0]
				return getTrainInfo(trainData)
			})
	},
	trainInfoForAll: () => {
		return request.getAsync(`${requestBase}/live-trains`)
			.then((response) => {
				let trainsData = JSON.parse(response[0].body)
				return trainsData.map(getTrainInfo)
			})
	},
	trainStatusForAll: () => {
		return request.getAsync(`${requestBase}/live-trains`)
			.then((response) => {
				let trainsData = JSON.parse(response[0].body)
				return trainsData.map((data) => getTrainInfo(data, true))
			})
	}
}

function getTrainInfo(fullData, excludeStations) {
	let stations = getStationInfos(fullData)

	let trainInfo = {
		trainNumber: fullData.trainNumber,
		date: fullData.departureDate,
		type: fullData.trainType,
		cancelled: fullData.cancelled
	}

	if(excludeStations !== true) {
		trainInfo.stations = stations
	}

	function anyTrain(tester) { return stations.some(tester) }

	trainInfo.wasLate = anyTrain((station) => station.wasLate)
	trainInfo.willBeLate = anyTrain((station) => station.willBeLate)

	let nextStation = stations.find((station) => station.passed === false)
	trainInfo.station =
		(typeof nextStation !== 'undefined') ?
			nextStation.code : stations.slice(-1)[0].code

	trainInfo.depStation = stations[0].code
	trainInfo.arrStation = stations.slice(-1)[0].code

	trainInfo.departs = stations[0].scheduledTime
	trainInfo.arrives = stations.slice(-1)[0].scheduledTime
	trainInfo.hasDeparted = (stations[0].actualTime) ? true : false

	return trainInfo
}

function getStationInfos(fullData) {
	return fullData.timeTableRows
		.filter((timeTableRow, index, rows) => {
			return timeTableRow.trainStopping
			&& (timeTableRow.type !== 'ARRIVAL' || index === rows.length-1)
		})
		.map(toSimpleStation)
}

function toSimpleStation(stationInfo) {
	let simpleInfo = {
		code: stationInfo.stationShortCode,
		scheduledTime: stationInfo.scheduledTime,
		passed: (stationInfo.actualTime) ? true: false,
		actualTime: stationInfo.actualTime,
		estimateTime: stationInfo.liveEstimateTime
	}

	function isLate(realTime) {
		return moment(realTime).diff(moment(simpleInfo.scheduledTime), 'seconds') > 2*60
	}

	if(simpleInfo.actualTime) {
		simpleInfo.wasLate = isLate(simpleInfo.actualTime)
	}
	if(simpleInfo.estimateTime) {
		simpleInfo.willBeLate = isLate(simpleInfo.estimateTime)
	}

	return simpleInfo
}