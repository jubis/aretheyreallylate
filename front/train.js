'use strict'


function getTime(stringTime) {
	return moment(stringTime).format('H:mm')
}

const Train  = React.createClass({
	initMap: function() {
		if(this.props.big) {
			const {prevStation, nextStation} = this.props.info
			const {latitude: lat, longitude: lng, name} = nextStation ? nextStation : prevStation
			const center = {lat, lng}

			const map = new google.maps.Map($('.map')[0], {
				zoom: 9,
				center: center,
				disableDefaultUI: true
			})

			const next = new google.maps.Marker({
				position: center,
				map: map,
				title: name
			})

			if(nextStation && !prevStation) console.log(`next but no prev ${this.props.info}`)

			if(nextStation && prevStation) {
				const currentSectionCoords  = [
					{lat: prevStation.latitude, lng: prevStation.longitude},
					{lat: nextStation.latitude, lng: nextStation.longitude}
				];
				const currentSection = new google.maps.Polyline({
					path: currentSectionCoords,
					geodesic: true,
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					map: map
				})

				const bounds = new google.maps.LatLngBounds(center)
				bounds.extend(new google.maps.LatLng(prevStation.latitude, prevStation.longitude))
				map.fitBounds(bounds)
			}
		}
	},
	render: function() {
		const {info, setSelectedTrain, big} = this.props

		function showStation(station) {
			return big ? station.name : station.code
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

		let nextStation = (!info.hasArrived && info.hasDeparted) ?
			<p>next: {showStation(info.nextStation)}</p> :
			''
		let arrivedOrNotDeparted = ''
		if (info.hasArrived) arrivedOrNotDeparted = <p>Arrived to {showStation(info.arrStation)}</p>
		else if (!info.hasDeparted && !info.cancelled) arrivedOrNotDeparted = <p>Hasn't departed yet</p>

		return (
			<div className={classes} onClick={() => setSelectedTrain(info)}>
				{header}
				<p className='tight'>{showStation(info.depStation)} - {showStation(info.arrStation)}</p>

				<p className='tight'>{getTime(info.departs)} - {getTime(info.arrives)}</p>
				{arrivedOrNotDeparted}
				{nextStation}
				<p className='tight'>{late}</p>
				{maxLate}
				{big ? <div className='map' ref={this.initMap}/> : ''}
			</div>
		)
	}
})

module.exports = {
	Train: Train
}