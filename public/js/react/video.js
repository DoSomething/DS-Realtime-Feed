// Total seconds
const videoLength = 72;

var Video = React.createClass({
  getInitialState: function() {
    return {
      displayVideo: true,
    };
  },

  componentDidMount: function() {
    setInterval(() => {
      this.setState({displayVideo: !this.state.displayVideo})
    }, videoLength * 1000);
  },

  render: function() {
    if (!this.state.displayVideo) {
      return null;
    }

    const width = (document.getElementById('gallery-video').offsetWidth - 64);
    const height = Math.round((width / 16) * 9);

    return (
      <iframe width={width} height={height} src="https://www.youtube.com/embed/BBCBM32_kVA?autoplay=1&showinfo=0" frameborder="0" allowfullscreen></iframe>
    );
  }
});

var video = ReactDOM.render(
  <Video />,
  document.getElementById('gallery-video')
);
