
const Icon = React.createClass({
	render: function() {
		return (
			<i className={classNames('fa', this.props.name)}></i>
		)
	}
})

const refreshS = new Bacon.Bus()
refreshS.plug(Bacon.interval(5000, 0))

$('document').ready(() => {
	ReactDOM.render(
		<div>
			<TrainList refreshS={refreshS} />
			<TrainView trainS={selectedTrainB} />
		</div>,
		document.getElementById('content')
	)
	refreshS.push(0)
})
