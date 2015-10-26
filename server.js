let express = require('express')
let bodyParser = require('body-parser')
let Bacon = require('baconjs')

let trains = require('./trains')

let app = express()
app.use(bodyParser.json())
app.use(express.static('front'))

app.get('/train', (req, res) => {
	trains.trainInfoForAll().then(respondJson(res))
})

app.get('/train/:trainNumber', (req, res) => {
	let trainNumber = req.params.trainNumber

	trains.trainInfoFor(trainNumber).then(respondJson(res))
})

app.get('/trainStatus', (req, res) => {
	trains.trainStatusForAll().then(respondJson(res))
})

function respondJson(res) {
	return (content) => {
		res.contentType('application/json').send(content)
	}
}

app.listen(8081, () => {
	console.log('Data-access server listening on port ' + 8081)
})
