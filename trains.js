'use strict';

let Promise = require('bluebird')
let request = require('request')
let moment = require('moment')
let bunyan = require('bunyan')
let Bacon = require('baconjs')

let logger = bunyan.createLogger({name: 'Trains'})

Promise.promisifyAll(request)

let apiHost = 'rata.digitraffic.fi'
let apiUriBase = '/api/v1/'
let requestBase = `http://${apiHost}${apiUriBase}`

let trainStatusForAllCache = null

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
		let deepCopiedCache = deepClone(trainStatusForAllCache)
		return Promise.resolve(deepCopiedCache)
	}
}

Bacon.interval(30*1000, 1).merge(Bacon.once(1))
	.flatMap(() => {
		logger.info('Query API')
		return Bacon.fromPromise(request.getAsync(`${requestBase}/live-trains`))
	})
	.map((response) => {
		logger.info('API query done')

		const trainsData = JSON.parse(response[0].body)
		logger.info(`${trainsData.length} trains to handle`)

		const statuses = trainsData.map((data) => getTrainInfo(data, true))
		logger.info('Train statuses ready')

		const grouped = groupTrainsByType(statuses)
		return Object.keys(grouped)
			.map(groupName => ({name: groupName, trains: grouped[groupName]}))
			.map(group => {
				group.status = countStatusAggrFor(group.trains)
				return group
			})
			.map(group => {
				group.trains.sort((train1, train2) =>
					moment(train1.departs).valueOf() - moment(train2.departs).valueOf()
				)
				return group
			})
			.sort((group1, group2) => group1.name.localeCompare(group2.name))
	})
	.onValue((statuses) => trainStatusForAllCache = statuses)

function getTrainInfo(fullData, excludeStations) {
	let stations = getStationInfos(fullData)

	let trainInfo = {
		trainNumber: fullData.trainNumber,
		date: fullData.departureDate,
		type: fullData.trainType,
		cancelled: fullData.cancelled
	}

	if(fullData.commuterLineID) {
		trainInfo.commuterLine = fullData.commuterLineID
	}

	if(excludeStations !== true) {
		trainInfo.stations = stations
	}

	function anyTrain(tester) { return stations.some(tester) }

	trainInfo.wasLate = anyTrain((station) => station.wasLate)
	trainInfo.willBeLate = anyTrain((station) => station.willBeLate)

	let howMuchLateAllStations =
		stations
			.filter((station) => Boolean(station.lateMins))
			.map((station) => station.lateMins)
			.concat([0]) // easy way to handle empty lists
	trainInfo.maxLate = Math.max.apply(null, howMuchLateAllStations)
	trainInfo.onlyLightlyLate = trainInfo.maxLate <= 5

	let nextStation = stations.find((station) => station.passed === false)
	trainInfo.station =
		(typeof nextStation !== 'undefined') ?
			nextStation.code : stations.slice(-1)[0].code

	trainInfo.depStation = stations[0].code
	trainInfo.arrStation = stations.slice(-1)[0].code

	trainInfo.departs = stations[0].scheduledTime
	trainInfo.arrives = stations.slice(-1)[0].scheduledTime
	trainInfo.hasDeparted = Boolean(stations[0].actualTime)
	trainInfo.hasArrived = Boolean(stations.slice(-1)[0].actualTime)

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

	function lateMins(realTime) {
		let howMuchLate = moment(realTime).diff(moment(simpleInfo.scheduledTime), 'seconds')
		return (howMuchLate > 2*60) ? howMuchLate/60 : 0
	}

	function markIfLate(realTime, markedFieldName) {
		if(realTime) {
			let late = lateMins(realTime)
			simpleInfo[markedFieldName] = Boolean(late)
			if (late > 0) {
				simpleInfo.lateMins = Math.floor(late)
			}
		}
	}

	markIfLate(simpleInfo.actualTime, 'wasLate')
	markIfLate(simpleInfo.estimateTime, 'willBeLate')

	return simpleInfo
}

function groupTrainsByType(trains) {
	return trains.reduce((grouped, train) => {
		if(grouped[train.type]) {
			grouped[train.type].push(train)
		}
		else {
			grouped[train.type] = [train]
		}
		return grouped
	}, {})
}

function countStatusAggrFor(trains) {
	const aggregations = {
		total: trains.length,
		onSchedule: trains.filter(train => train.hasDeparted && !train.maxLate && !train.cancelled).length,
		departed: trains.filter(train => train.hasDeparted).length,
		lightlyLate: trains.filter(train => train.maxLate > 0 && train.onlyLightlyLate).length,
		late: trains.filter(train => train.maxLate > 0 && !train.onlyLightlyLate).length,
		cancelled: trains.filter(train => train.cancelled).length
	}

	aggregations.notDeparted = trains.filter(train => !train.hasDeparted).length - aggregations.cancelled

	return aggregations
}

function deepClone(object) {
	return JSON.parse(JSON.stringify(object))
}