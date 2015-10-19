var searches = new Bacon.Bus()

let trainsData = searches
	.map(trainNumber => `/trainStatus`)
	.log('path')
	.map(path => { return {type:'GET', url: path} })
	.log('request')
	.ajax().log('ajax')

function getTime(stringTime) {
	return moment(stringTime).format('H:mm')
}

let Train = React.createClass({
	render: function() {
		let info = this.props.info

		let isLate = info.wasLate || info.willBeLate
		let isOnSchdule = !isLate && info.hasDeparted

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
			{late: isLate, 'on-schedule': isOnSchdule, 'cancelled': info.cancelled}
		)

		let nextStation = (!info.hasArrived && info.hasDeparted) ? <p>next: {info.station}</p> : ''
		let arrivedOrNotDeparted = ''
		if (info.hasArrived) arrivedOrNotDeparted = <p>Arrived to {info.arrStation}</p>
		else if (!info.hasDeparted) arrivedOrNotDeparted = <p>Hasn't departed yet</p>

		return (
			<div className={classes}>
				<h3>{info.type} {info.trainNumber}</h3>
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

let TrainList = React.createClass({
	getInitialState: function() {
		return {trains: []}
	},
	componentDidMount: function() {
		console.log('did mount')
		trainsData.log('trainlist').onValue((trains) => this.setState({trains:trains}))
	},
	render: function() {
		console.log(this.state)
		let trains =
			this.state.trains
				.map((train) =>
					<Train info={train} key={train.trainNumber} />
				)

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
