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
          photo: "/images/logo.svg"
        },
        {
          id: 1,
          side: "back",
          photo: ""
        },
        {
          id: 2,
          side: "left",
          photo: ""
        },
        {
          id: 3,
          side: "right",
          photo: ""
        },
        {
          id: 4,
          side: "top",
          photo: ""
        },
        {
          id: 5,
          side: "bottom",
          photo: ""
        }
      ]
    };
  },
  getPhoto: function(index) {
    var request = $.get('/reportbacks', function (rb) {
      this.state.faces[index].photo = rb;
    }.bind(this));
    this.requests.push(request);
  },
  rotate: function() {
    // re-render to make sure the photo state changes are in place
    this.forceUpdate();

    // rotate the cube & change the photo
    this.setState({
      rotate: true
    });

    for (var i = 0; i < 6; i++) {
      this.getPhoto(i);
    }
  },
  componentDidMount: function() {
    this.requests = [];
    this.rotateLoop = setInterval(this.rotate, 6 * 1000);
  },
  componentWillUnmount: function() {
    if (this.rotateLoop) {
      clearTimeout(this.rotateLoop);
    }

    if (this.updateLoop) {
      clearTimeout(this.updateLoop);
    }

    if (this.requests) {
      for (var request of this.requests) {
        request.abort();
      }
    }
  },
  render: function() {
    var flip = (this.state.rotate ? (Math.random() > 0.5 ? "-flip_1" : "-flip_2") : "");
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
