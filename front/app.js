
const {TrainList} = require('./train-list.js')
const {TrainView} = require('./train-view.js')
const {trainsData, createAction} = require('./data.js')

const Icon = React.createClass({
	render: function() {
		return (
			<i className={classNames('fa', this.props.name)}></i>
		)
	}
})

const refresh = createAction()

const model = function() {

	refresh.$.plug(Bacon.interval(5000, 0))
	const $trains = trainsData(refresh.$)
	refresh.action(0)

	const selectTrain = createAction()
	const $selectedTrain = selectTrain.$
	const $trainListModel = Bacon.combineTemplate({
		trains: $trains,
		setSelectedTrain: selectTrain.action
	})

	const closeTrainView = createAction()
	const $trainViewModel = Bacon.combineTemplate({
			train: $selectedTrain,
			closeView: closeTrainView.action,
			visible: Bacon.update(false,
				[closeTrainView.$], (close) => false,
				[$selectedTrain], (close) => true
			)
		})
		.map(model => (model.visible) ? model : null)

	return Bacon.update(
		{},
		[$trainListModel.changes()], (state, trainList) => ({...state, trainList}),
		[$trainViewModel.changes()], (state, trainView) => ({...state, trainView})
	).log('state')
}

$('document').ready(() => {
	model().map(state =>
			<div>
				{(state.trainList) ? TrainList(state) : null}
				{(state.trainView) ? TrainView(state) : null}
			</div>
		)
		.onValue(elem => ReactDOM.render(elem, document.getElementById('content')))

	refresh.action()
})
