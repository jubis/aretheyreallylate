'use strict';

let express = require('express')
let bodyParser = require('body-parser')
let Bacon = require('baconjs')

const fs = require("fs");
const browserify = require("browserify");



let trains = require('./trains')

let app = express()
app.use(bodyParser.json())
app.use(express.static('front'))

app.get('/train/:trainNumber', (req, res) => {
	let trainNumber = req.params.trainNumber

	trains.trainInfoFor(trainNumber).then(respondJson(res))
})

app.get('/trainStatus', (req, res) => {
	trains.trainStatusForAll().then(respondJson(res))
})

app.get('/check', (req, res) => {
	trains.checkTrains().then(respondJson(res))
})

function respondJson(res) {
	return (content) => {
		res.contentType('application/json').send(content)
	}
}

app.get('/scripts.js', (req, res) => {
	browserify('front/app.js', {debug: true})
		.transform("babelify", {presets: ["es2015", "react"], plugins: ["transform-object-rest-spread"]})
		.bundle()
		.pipe(res);
})

app.listen(8081, () => {
	console.log('Data-access server listening on port ' + 8081)
})
