const TrainView = React.createClass({
	getInitialState: function() { return {train:null} },
	componentDidMount: function() {
		this.props.trainS
			.log()
			.onValue(train => this.setState({train: train}))
	},
	componentDidUpdate: function() {
		$('.train-view-bg').asEventStream('click')
			.log('train view clicked')
			.onValue(value => this.setState({train:null}))
	},
	render: function() {
		const train = this.state.train
		return (train != null) ?
			<div className='train-view'>
				<div className='train-view-bg'></div>
				<Train info={train} showMap={true} />
			</div> :
			<div style={{display:'none'}}></div>
	}
})