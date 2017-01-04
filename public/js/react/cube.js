function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Face = React.createClass({
  render: function() {
    return (
      <div className={"cube__face -" + this.props.side}>
        <img src={this.props.photo}></img>
      </div>
    );
  }
});

var Cube = React.createClass({
  getInitialState: function() {
    return {
      rotate: "",
      faces: [
        {
          id: 0,
          side: "front",
          photo: "/images/logo.svg",
          request: undefined
        },
        {
          id: 1,
          side: "back",
          photo: "",
          request: undefined
        },
        {
          id: 2,
          side: "left",
          photo: "",
          request: undefined
        },
        {
          id: 3,
          side: "right",
          photo: "",
          request: undefined
        },
        {
          id: 4,
          side: "top",
          photo: "",
          request: undefined
        },
        {
          id: 5,
          side: "bottom",
          photo: "",
          request: undefined
        }
      ]
    };
  },
  setPhotos: function(callback) {
    this.serverRequest = $.get('/reportbacks', function (rbs) {
      for (var i = 0; i < rbs.length; i++) {
        this.state.faces[i].photo = rbs[i];
      }
      // re-render to make sure the photo state changes are in place
      this.forceUpdate();
      if (callback) {
        callback();
      }
    }.bind(this));
  },
  rotate: function() {
    // rotate the cube & change the photo
    this.setState({
      rotate: true
    });

    this.setPhotos();

    this.updateTimer = setTimeout(function() {
      this.setState({
        rotate: false
      });
    }.bind(this), 6 * 1000);
  },
  componentDidMount: function() {
    this.requests = [];
    this.setPhotos(function() {
      this.rotate();
      this.rotateLoop = setInterval(this.rotate, 12 * 1000);
    }.bind(this));
  },
  componentWillUnmount: function() {
    if (this.rotateLoop) {
      clearTimeout(this.rotateLoop);
    }

    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }

    if (this.serverRequest) {
      this.serverRequest.abort();
    }
  },
  render: function() {
    var flip = (this.state.rotate ? `-flip_${getRandomInt(0, 5)}` : "idle");
    return (
      <div className="dashboard__scene">
        <div className={"cube " + flip}>
          {this.state.faces.map(function(face) {
            return <Face key={face.id} side={face.side} photo={face.photo} />;
          })}
        </div>
      </div>
    );
  }
});

var cube = ReactDOM.render(
  <Cube />,
  document.getElementById('gallery-cube')
);
