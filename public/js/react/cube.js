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
  getPhoto: function(index, callback) {
    // Try to let the existing request finish instead
    if (this.state.faces[index].request != undefined) {
      return;
    }

    this.state.faces[index].request = $.get('/reportbacks', function (rb) {
      this.state.faces[index].photo = rb;
      this.state.faces[index].request = undefined;
      if (callback) {
        callback(index);
      }
    }.bind(this));
  },
  setPhotos: function(callback) {
    for (var i = 0; i < 6; i++) {
      this.getPhoto(i, function(index) {
        if (index == 5) {
          // re-render to make sure the photo state changes are in place
          this.forceUpdate();
          if (callback) {
            callback();
          }
        }
      }.bind(this));
    }
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

    if (this.requests) {
      for (var face of this.state.faces) {
        if (face.request != undefined) {
          face.request.abort();
        }
      }
    }
  },
  render: function() {
    var flip = (this.state.rotate ? (Math.random() > 0.5 ? "-flip_1" : "-flip_2") : "idle");
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
  document.getElementById('gallery')
);
