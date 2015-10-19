'use strict';

var searches = new Bacon.Bus();

var trainsData = searches.map(function (trainNumber) {
	return '/trainStatus';
}).log('path').map(function (path) {
	return { type: 'GET', url: path };
}).log('request').ajax().log('ajax');

function getTime(stringTime) {
	return moment(stringTime).format('H:mm');
}

var Train = React.createClass({
	displayName: 'Train',

	render: function render() {
		var info = this.props.info;

		var isLate = info.wasLate || info.willBeLate;
		var isOnSchdule = !isLate && info.hasDeparted;

		var late = '';
		if (info.willBeLate) late = 'Is late';else if (info.wasLate) late = 'Was late';else if (info.hasDeparted) late = 'On schedule';else if (info.cancelled) late = 'Cancelled';

		if (isLate) {
			var maxLate = React.createElement(
				'p',
				{ className: 'tight' },
				'Late max ',
				info.maxLate,
				' mins'
			);
		}

		var classes = classNames('train', { late: isLate, 'on-schedule': isOnSchdule, 'cancelled': info.cancelled });

		var nextStation = !info.hasArrived && info.hasDeparted ? React.createElement(
			'p',
			null,
			'next: ',
			info.station
		) : '';
		var arrivedOrNotDeparted = '';
		if (info.hasArrived) arrivedOrNotDeparted = React.createElement(
			'p',
			null,
			'Arrived to ',
			info.arrStation
		);else if (!info.hasDeparted) arrivedOrNotDeparted = React.createElement(
			'p',
			null,
			'Hasn\'t departed yet'
		);

		return React.createElement(
			'div',
			{ className: classes },
			React.createElement(
				'h3',
				null,
				info.type,
				' ',
				info.trainNumber
			),
			React.createElement(
				'p',
				{ className: 'tight' },
				info.depStation,
				' - ',
				info.arrStation
			),
			React.createElement(
				'p',
				{ className: 'tight' },
				getTime(info.departs),
				' - ',
				getTime(info.arrives)
			),
			arrivedOrNotDeparted,
			nextStation,
			React.createElement(
				'p',
				{ className: 'tight' },
				late
			),
			maxLate
		);
	}
});

var TrainList = React.createClass({
	displayName: 'TrainList',

	getInitialState: function getInitialState() {
		return { trains: [] };
	},
	componentDidMount: function componentDidMount() {
		var _this = this;

		console.log('did mount');
		trainsData.log('trainlist').onValue(function (trains) {
			return _this.setState({ trains: trains });
		});
	},
	render: function render() {
		console.log(this.state);
		var trains = this.state.trains.map(function (train) {
			return React.createElement(Train, { info: train, key: train.trainNumber });
		});

		return React.createElement(
			'div',
			{ className: 'train-list' },
			trains.length === 0 ? 'Loading...' : '',
			trains
		);
	}
});

$('document').ready(function () {
	ReactDOM.render(React.createElement(TrainList, null), document.getElementById('content'));
	searches.push(0);
});

//# sourceMappingURL=app.js.map