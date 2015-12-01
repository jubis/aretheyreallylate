'use strict'

module.exports = {
	Train: Train
}


function getTime(stringTime) {
	return moment(stringTime).format('H:mm')
}

function Train(info, setSelectedTrain, showMap) {

	function initMap(ref) {
		new google.maps.Map(ref, {
			zoom: 9,
			center: {lat: 60.173622, lng: 24.940724},
			disableDefaultUI: true
		})
	}

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

	let nextStation = (!info.hasArrived && info.hasDeparted) ? <p>next: {info.nextStation}</p> : ''
	let arrivedOrNotDeparted = ''
	if (info.hasArrived) arrivedOrNotDeparted = <p>Arrived to {info.arrStation}</p>
	else if (!info.hasDeparted && !info.cancelled) arrivedOrNotDeparted = <p>Hasn't departed yet</p>

	return (
		<div className={classes} onClick={setSelectedTrain} key={info.trainNumber}>
			{header}
			<p className='tight'>{info.depStation} - {info.arrStation}</p>
			<p className='tight'>{getTime(info.departs)} - {getTime(info.arrives)}</p>
			{arrivedOrNotDeparted}
			{nextStation}
			<p className='tight'>{late}</p>
			{maxLate}
			{showMap ? <div className='map' ref={initMap} /> : ''}
		</div>
	)
}