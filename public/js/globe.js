function Globe() {
  var module = {};

  var globePoints = [];

  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  var visitColors = ['#fcd116', '#4e2b63', '#999', '#ddd', '#ff4747'];
  module.handleWebVisit = function(code) {
    var id = getRandomArbitrary(0, 100000);
    var point = {id: id, code: code, offX: getRandomArbitrary(-5, 5), offY: getRandomArbitrary(-5, 5), color: visitColors[Math.floor(Math.random()*visitColors.length)], hide: 4};
    globePoints.push(point);
    setTimeout(function(id, point) {
      globePoints.splice(globePoints.indexOf(point), 1);
    }, 10000, id, point);
  }

  module.draw = function() {
    var $logo = $('.dashboard__header img');
    var width = $logo.width();
    var height = $logo.height();
    var radius = height / 2 - 5;
    var scale = radius;
    var velocity = .04;
    var projection = d3.geo.orthographic()
      .translate([width / 2, height / 2])
      .scale(scale)
      .clipAngle(90);
    var canvas = d3.select('#globe')
      .attr("width", width)
      .attr("height", height);
    var context = canvas.node().getContext("2d");
    var path = d3.geo.path()
      .projection(projection)
      .context(context);
    d3.json("/data/world-110m.json", function(error, world) {
        if (error) throw error;
        d3.json("/data/country_codes.json", function(error, country_codes) {
          if (error) throw error;
          d3.json("/data/world_atlas.json", function(error, atlas) {
            if (error) throw error;

            var land = topojson.feature(world, world.objects.land);
            var countries = topojson.feature(world, world.objects.countries);
            console.log(countries);

            var countriesComplete = {};

            atlas.fixed = {};
            atlas.forEach(function(element, index, array) {
              atlas.fixed[element.id] = element;
            });
            country_codes.fixed = {};
            country_codes.data.forEach(function(element, index, array) {
              country_codes.fixed[element.name] = element;
            });

            countries.fixed = {};
            countries.features.forEach(function(element, index, array ) {
              // console.log(element);
              var id = element.id;
              var fixed = atlas.fixed[id];
              if (fixed == undefined) {
                return;
              }
              var countryName = atlas.fixed[id].name;
              var fixed = country_codes.fixed[countryName];
              if (fixed == undefined) {
                console.log(countryName);
                return;
              }
              var countryCode = fixed.code;
              var geometry = element.geometry;
              countries.fixed[countryCode] = element;
              countriesComplete[countryCode] = {id: id, name: countryName, code: countryCode, geometry: geometry};
            });

            console.log(countriesComplete);

            d3.timer(function(elapsed) {
              context.fillStyle = "#FFF";
              context.fillRect(0, 0, width, height);

              projection.rotate([velocity * elapsed, 0]);

              context.beginPath();
              context.arc(width / 2, height / 2, radius, 0, 2 * Math.PI, true);
              context.lineWidth = .5;
              context.fillStyle = "#23b7fb";
              context.fill();

              for (var code in countriesComplete) {
                var c = countriesComplete[code];
                context.beginPath();
                path(c.geometry);
                context.fillStyle = "#FFF";
                context.fill();
              }

              globePoints.forEach(function(element, index, array) {
                var center = d3.geo.centroid(countries.fixed[element.code]);
                var projectedPoints = projection(center);

                if (element.lastX == undefined) {
                  element.lastX = 0;
                }
                else if(element.lastX > projectedPoints[0]) {
                  element.lastX = projectedPoints[0];
                  return;
                }

                if (element.hide > 0) {
                  element.hide -= 1;
                }
                else {
                  context.beginPath();
                  context.arc(projectedPoints[0] + element.offX, projectedPoints[1] + element.offY, 10, 0, Math.PI * 2);
                  context.fillStyle = element.color;
                  context.fill();
                }

                element.lastX = projectedPoints[0];
              });

            });
          });
        });
      });
  }

  return module;
}
