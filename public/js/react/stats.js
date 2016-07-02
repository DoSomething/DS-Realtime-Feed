var MemberCount = React.createClass({
  getInitialState: function() {
    return {
      count: 'fetching member count...',
    };
  },
  fetchCount: function() {
    this.serverRequest = $.post('/stats/members', function (result) {
      var count = result;
      this.setState({
        count: `${count} Members`
      });
    }.bind(this));
  },
  componentDidMount: function() {
    this.fetchCount();
    this.timerId = setInterval(this.fetchCount, 60 * 1000);
  },
  componentWillUnmount: function() {
    if (this.serverRequest) {
      this.serverRequest.abort();;
    }
    clearTimeout(this.timerId);
  },
  render: function() {
    return (
      <div className="card">
        <h1>{this.state.count}</h1>
      </div>
    );
  }
});

ReactDOM.render(
  <MemberCount />,
  document.getElementById('stats')
);
