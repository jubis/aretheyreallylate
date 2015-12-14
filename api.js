const bunyan = require('bunyan')
const request = require('request')
const Promise = require('bluebird')

Promise.promisifyAll(request)

const apiHost = 'rata.digitraffic.fi'
const apiUriBase = '/api/v1/'
const requestBase = `http://${apiHost}${apiUriBase}`

module.exports = function(relativeUrl) {
	return request.getAsync(`${requestBase}/${relativeUrl}`)
		.then(response => response[0].body)
}