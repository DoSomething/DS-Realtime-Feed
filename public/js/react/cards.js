var Card = React.createClass({
  render: function() {
    return (
      <div className={"card -" + this.props.type}>
        <img className="card__photo" src={this.props.photo}></img>
        <div className="card__body">
          <h1>{this.props.name}</h1>
          <p>{this.props.action}</p>
        </div>
      </div>
    );
  }
});

var Notifications = React.createClass({
  getInitialState: function() {
    return {
      notifications: []
    };
  },
  push: function(notification) {
    this.state.notifications.unshift(notification);
    if (this.state.notifications.length > 5) {
      this.state.notifications.pop();
    }
    this.forceUpdate(); // Would avoid this but React doesn't seem to detect the state change
  },
  componentDidMount: function() {
    this.serverRequest = $.get('/notifications/recent', function (result) {
      for (var notif of result) {
        this.push(notif);
      }
    }.bind(this));
  },
  componentWillUnmount: function() {
    if (this.serverRequest) {
      this.serverRequest.abort();;
    }
  },
  render: function() {
    return (
      <div>
        {this.state.notifications.map(function(notification) {
          return <Card key={notification.id} type={notification.type} photo={notification.photo} name={notification.name} action={notification.action}/>;
        })}
      </div>
    );
  }
})

var notifications = ReactDOM.render(
  <Notifications />,
  document.getElementById('notifications')
);

var socket = io.connect(location.host);
socket.on('notification', function(data) {
  notifications.push(data);
});
