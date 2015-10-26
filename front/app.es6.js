var searches = new Bacon.Bus()

let trainsData = searches
	.map(trainNumber => `/trainStatus`)
	.map(path => { return {type:'GET', url: path} })
	.ajax()

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

const TrainGroup = React.createClass({
	render: function() {
		const status = this.props.info.status
		return (
			<div className='train-group'>
				<div className='group-header'>
					<h2>{this.props.info.name}</h2>
					<div className='status'>
						<span>X {status.total}</span>
						<span>Not late X {status.onSchedule}</span>
						<span>Lightly late X {status.lightlyLate}</span>
						<span>Late X {status.late}</span>
					</div>
				</div>
				<div className='train-container'>{this.props.children}</div>
			</div>
		)
	}
})

let TrainList = React.createClass({
	getInitialState: function() {
		return {trains: []}
	},
	componentDidMount: function() {
		console.log('did mount')
		trainsData
			.log('trainlist')
			.onValue(trains => this.setState({trains:trains}))
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
			<div className="train-list">
				{(trains.length === 0) ? 'Loading...' : ''}
				{trains}
			</div>
		)
	}
})

$('document').ready(() => {
	ReactDOM.render(
		<TrainList />,
		document.getElementById('content')
	)
	searches.push(0)
})
