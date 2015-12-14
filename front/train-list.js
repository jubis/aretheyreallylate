'use strict'

const {createAction} = require('./data.js')
const {Train} = require('./train.js')


module.exports = {
	TrainList: TrainList,
	Train: Train
}

function TrainList({trainList: model}) {

	function initAccordion(ref) {
		$(ref).accordion({
			exclusive: false,
			animateChildren: false
		})
	}

	const trains = model.trains
	const setSelectedTrain = model.setSelectedTrain
	return (
		<div>
			<div className="train-list ui accordion" ref={initAccordion}>
				{(trains.length === 0) ? 'Loading...' : ''}

				{trains.map(trainGroup => (
					<TrainGroup info={trainGroup} key={trainGroup.name}>
						{trainGroupChildren(trainGroup, setSelectedTrain)}
					</TrainGroup>
				))}
			</div>
		</div>
	)
}

function trainGroupChildren(trainGroup, setSelectedTrain) {
	return trainGroup.trains.map(train => (<Train info={train} setSelectedTrain={setSelectedTrain} key={train.type+train.trainNumber} />))
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
