
const Icon = React.createClass({
	render: function() {
		return (
			<i className={classNames('fa', this.props.name)}></i>
		)
	}
})

const refreshS = new Bacon.Bus()

$('document').ready(() => {
	ReactDOM.render(
		<TrainList refreshS={refreshS.merge(Bacon.interval(5000, 0))} />,
		document.getElementById('content')
	)
	refreshS.push(0)
})
