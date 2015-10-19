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
		if (isLate) late = 'Late';else if (info.hasDeparted) late = 'On schedule';else if (info.cancelled) late = 'Cancelled';else late = 'Hasn\'t departed yet';

		var classes = classNames('train', { late: isLate, 'on-schedule': isOnSchdule, 'cancelled': info.cancelled });

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
				null,
				info.depStation,
				' - ',
				info.arrStation
			),
			React.createElement(
				'p',
				null,
				getTime(info.departs),
				' - ',
				getTime(info.arrives)
			),
			React.createElement(
				'p',
				null,
				info.station
			),
			React.createElement(
				'p',
				null,
				late
			)
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