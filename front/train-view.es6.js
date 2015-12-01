'use strict'

const {Train} = require('./train.es6')

module.exports = {
	TrainView: TrainView
}

function TrainView(model) {
	console.log('train view', model)
	console.log('args', arguments)

	return model.trainViewVisible
		.map(visible => (
			(visible) ?
				<div className='train-view'>
					<div className='train-view-bg' onClick={model.closeView}></div>
					{Train(model.train, function() {}, true)}
				</div> :
				<div style={{display:'none'}}></div>
		))
		.log('train view new')
}