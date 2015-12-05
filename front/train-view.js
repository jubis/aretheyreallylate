'use strict'

const {Train} = require('./train.js')

module.exports = {
	TrainView: TrainView
}

function TrainView({trainView: model}) {

	return (model.visible) ?
				<div className='train-view'>
					<div className='train-view-bg' onClick={model.closeView}></div>
					<Train info={model.train} showMap={true} />
				</div> :
				<div style={{display:'none'}}></div>
}