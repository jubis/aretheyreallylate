
const {TrainList} = require('./train-list.es6.js')
const {trainsData, createAction} = require('./data.es6.js')

const Icon = React.createClass({
	render: function() {
		return (
			<i className={classNames('fa', this.props.name)}></i>
		)
	}
})


const createTrainListModel = function(interval) {
	const refreshS = new Bacon.Bus()
	refreshS.plug(Bacon.interval(interval, 0))

	const $trains = trainsData(refreshS).log('trains')
	const selectTrain = createAction()

	return {
		$trains: $trains,
		$selectedTrain: selectTrain.$.toProperty('1').log('selected train'),
		setSelectedTrain: selectTrain.action
	}
}

$('document').ready(() => {
	Bacon.combineTemplate(
			<div>
				{TrainList(createTrainListModel(5000))}
			</div>
		)
		.log('App:')
		.onValue(elem => ReactDOM.render(elem, document.getElementById('content')))
})
