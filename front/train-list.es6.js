'use strict'

const {createAction} = require('./data.es6')
const {TrainView} = require('./train-view.es6')
const {Train} = require('./train.es6')


module.exports = {
	TrainList: TrainList,
	Train: Train
}

function createTrainViewModel(selectedTrain) {
	const closeTrainView = createAction()

	return {
		train: selectedTrain,
		closeView: closeTrainView.action,
		trainViewVisible: closeTrainView.$
			.map(false)
			.toProperty(typeof selectedTrain != 'undefined')
			.log('train view visible')
	}
}

function TrainList(trainListModel) {

	function initAccordion(ref) {
		console.log('init accordion')
		$(ref).accordion({
			exclusive: false,
			animateChildren: false
		})
	}

	const trains = trainListModel.$trains.log('trains in list')
	const setSelectedTrain = trainListModel.setSelectedTrain
	const trainViewModel = trainListModel.$selectedTrain.map(createTrainViewModel)
	return (
		<div>
			{trainViewModel.log('trainviewmodel').flatMap(model => TrainView(model))}
			<div className="train-list ui accordion" ref={initAccordion}>
				{(trains.map(trains => trains.length === 0)) ? 'Loading...' : ''}

				{trains.map(trainGroups => trainGroups.map(trainGroup => (
					<TrainGroup info={trainGroup} key={trainGroup.name}>
						{trainGroupChildren(trainGroup, setSelectedTrain)}
					</TrainGroup>
				)))}
			</div>
		</div>
	)
}

function trainGroupChildren(trainGroup, setSelectedTrain) {
	console.log('train group', trainGroup)
	return trainGroup.trains.map(train => Train(train, setSelectedTrain))
}

function getStatusValues(status) {
	const values = [status.onSchedule, status.lightlyLate, status.late, status.cancelled, status.notDeparted]
	return values.map(value => value/status.total)
}

const TrainGroup = React.createClass({
	getInitialState: function() {
		return {open:false}
	},
	componentDidMount: function() {
		const statusValues = getStatusValues(this.props.info.status)
		d3.select(this.refs.graph).selectAll('div')
			.data(statusValues)
			.enter().append('div').insert('p')
			.text(value => Math.round(value*100).toString() + '%')
		d3.select(this.refs.graph).selectAll('div')
			.data(statusValues)
			.attr('class', 'graph-part')
			.style('width', value => value*100 + '%')
			.style('display', value => value == 0 ? 'none' : 'auto')
	},
	render: function() {
		const status = this.props.info.status
		return (
			<div className='train-group'>
				<div className='group-header title'>
					<div className='type'>
						<h2>{this.props.info.name}</h2>
						<span>X {status.total}</span>
					</div>
					<div className='status' ref='status'>
						<span>On schedule<br/>{status.onSchedule}</span>
						<span>Lightly late<br/>{status.lightlyLate}</span>
						<span>Late<br/>{status.late}</span>
						<span>Cancelled<br/>{status.cancelled}</span>
					</div>
					<div className='graph' ref='graph'></div>
				</div>
				<div className='train-container content'>{this.props.children}</div>
			</div>
		)
	}
})
