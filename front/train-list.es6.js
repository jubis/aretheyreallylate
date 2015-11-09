'use strict'

const TrainList = React.createClass({
	getInitialState: function() {
		return {trains: []}
	},
	componentDidMount: function() {
		trainsData(this.props.refreshS)
			.log('trainlist')
			.onValue(trains => this.setState({trains:trains}))
	},
	initAccordion: function(ref) {
		console.log('init accordion')
		$(ref).accordion({
			exclusive: false,
			animateChildren: false
		})
	},
	render: function() {
		let trains =
			this.state.trains
				.map(trainGroup => (
					<TrainGroup info={trainGroup} key={trainGroup.name}>
						{trainGroup.trains.map(train =>
								<Train info={train} key={train.trainNumber}/>
						)}
					</TrainGroup>
				))

		return (
			<div className="train-list ui accordion" ref={this.initAccordion}>
				{(trains.length === 0) ? 'Loading...' : ''}
				{trains}
			</div>
		)
	}
})

function getTime(stringTime) {
	return moment(stringTime).format('H:mm')
}

let Train = React.createClass({
	render: function() {
		let info = this.props.info

		const header = (!info.commuterLine) ?
			<h3>{info.type} {info.trainNumber}</h3> :
			<h3 className='commuter'>{info.commuterLine}</h3>

		let isLate = info.wasLate || info.willBeLate
		let isOnSchedule = !isLate && info.hasDeparted

		let late = ''
		if (info.willBeLate) late = 'Is late'
		else if (info.wasLate) late = 'Was late'
		else if (info.hasDeparted) late = 'On schedule'
		else if (info.cancelled) late = 'Cancelled'

		if (isLate) {
			var maxLate = <p className='tight'>Late max {info.maxLate} mins</p>
		}

		let classes = classNames(
			'train',
			{
				'lightly-late': isLate && info.maxLate <= 5,
				'late': isLate && info.maxLate > 5,
				'on-schedule': isOnSchedule,
				'cancelled': info.cancelled
			}
		)

		let nextStation = (!info.hasArrived && info.hasDeparted) ? <p>next: {info.station}</p> : ''
		let arrivedOrNotDeparted = ''
		if (info.hasArrived) arrivedOrNotDeparted = <p>Arrived to {info.arrStation}</p>
		else if (!info.hasDeparted && !info.cancelled) arrivedOrNotDeparted = <p>Hasn't departed yet</p>

		return (
			<div className={classes}>
				{header}
				<p className='tight'>{info.depStation} - {info.arrStation}</p>
				<p className='tight'>{getTime(info.departs)} - {getTime(info.arrives)}</p>
				{arrivedOrNotDeparted}
				{nextStation}
				<p className='tight'>{late}</p>
				{maxLate}
			</div>
		)
	}
})

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
			.text(value => Math.round(value*100).toString().slice(0,2) + '%')
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
