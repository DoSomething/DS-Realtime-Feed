var slideLoopId;

// For dev'in and test'in
function stopSlideLoop() {
  clearTimeout(slideLoopId);
}

$(document).on('ready', function() {

  $('.box-container').each(function(index) {
    var totalBoxes = calculateBoxesPerSection('.box-container');
    for(var index = 0; index < totalBoxes; index++) {
      buildBoxes($(this));
    }
  });

  var socket = io.connect(location.host);
  socket.on('event', function(data) {
    handleUserEvent(data);
  })
  socket.on('web-visit', function(data) {
    handleWebVisit(data.code);
  });

  var globePoints = [];
  drawGlobe();

  var slides = ['slide-dosomething', 'slide-feed', 'slide-counts', 'slide-campaigns', 'slide-reportbacks', 'slide-members', 'slide-globe', 'slide-tmi'];
  var slideIndex = 0;

  if (!window.location.hash) {
    slideLoopId = setInterval(function slideUpdate() {
      if(slideIndex >= slides.length){
        slideIndex = 0;
      }
      var slide = slides[slideIndex];
      $('html, body').animate({
        scrollTop: $('.' + slide).offset().top
      }, 1000);
      slideIndex++;
    }, 5 * 1000);
  }

  function update() {
    updateDosomethingCount();
    updateStaffPick();
    updateFeaturedMembers();
    updateGlobe();
  }

  function updateDosomethingCount() {
    $.get('/module/counters/dosomething', function(data) {
      var rawVal = data.toString().replace(/,/g, '');
      updateCounter(rawVal, $('#member_counter'));
    });
  }

  function updateStaffPick() {
    var blocks = $('.campaign-block');
    $.get('/module/campaigns/random-campaigns', function(data) {
      data.forEach(function(element, index, array) {
        var block = $(blocks[index]);
        console.log(block);
        if(element.title == undefined) {
          updateStaffPick();
          return;
        }
        block.find('h1').text(element.title);
        block.find('img').attr('src', element.image);
        if(!element.staffpick) {
          block.find('p').hide();
        }
        else{
          block.find('p').show();
        }
        updateReportbacks(element.nid);
      });
    });
  }

  var reportbackBoxIndex = 0;
  function updateReportbacks(nid) {
    var totalBoxes = calculateBoxesPerSection(".slide-reportbacks");
    $.get('/module/campaigns/reportbacks/' + nid, function(data) {
      for(var index = 0; index < data.length; index++) {
        if(index >= totalBoxes) {
          return;
        }
        var dataIndex = Math.floor(Math.random() * data.length);
        var reportback = data[dataIndex];
        data.splice(dataIndex, 1);
        var image = '<img src="' + reportback.src + '" />';
        updateBox('box--reportback_image', image, $('.slide-reportbacks'), reportbackBoxIndex);
        reportbackBoxIndex++;
      }
    });
  }

  function updateFeaturedMembers() {
    $.get('/data/featured_members.json', function(data) {
      var members = data.members;
      $('.member').each(function(index) {
        var chosenMember = members[Math.floor(Math.random()*members.length)]; //Its the chosen one!
        members.splice(members.indexOf(chosenMember), 1);
        $(this).find('h2').text(chosenMember.title);
        $(this).find('h3').text(chosenMember.subtitle);
        $(this).find('p').text(chosenMember.copy);
        $(this).find('img').attr('src', chosenMember.photo_url);
      });
    });
  }

  function updateGlobe() {

  }

  function drawGlobe() {
    var width = $(window).width();
    var height = $(window).height() * .75;
    var radius = height / 2 - 5;
    var scale = radius;
    var velocity = .02;
    var projection = d3.geo.orthographic()
      .translate([width / 2, height / 2])
      .scale(scale)
      .clipAngle(90);
    var canvas = d3.select('.slide-globe').append('canvas')
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

              velocity = .05;
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
                context.fillStyle = "#4e2b63";
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

  var userBoxIndex = 0;
  function handleUserEvent(data) {
    var container = $('.slide-feed');
    var children = container.children();
    if(userBoxIndex >= children.length){
      userBoxIndex = 0;
    }
    var name = data.name || "Another Do-er";
    switch(data.activity) {
      case "user_register":
        updateBox('box--register', '<p><strong>' + name + "</strong> created an account!</p>", container, userBoxIndex);
        break;
      case "campaign_signup":
        updateBox('box--signup', '<p><strong>' + name + "</strong> signed up for " + data.campaign + "</p>", container, userBoxIndex);
        break;
      case "campaign_reportback":
        updateBox('box--reportback', '<p><strong>' + name + "</strong> reported back for " + data.campaign + "</p>", container, userBoxIndex);
        break;
    }
    userBoxIndex++
  }

  var visitColors = ['#fcd116', '#FFF', '#999', '#ddd', '#ff4747'];
  function handleWebVisit(code) {
    var id = getRandomArbitrary(0, 100000);
    var point = {id: id, code: code, offX: getRandomArbitrary(-10, 10), offY: getRandomArbitrary(-10, 10), color: visitColors[Math.floor(Math.random()*visitColors.length)], hide: 4};
    globePoints.push(point);
    setTimeout(function(id, point) {
      globePoints.splice(globePoints.indexOf(point), 1);
    }, 10000, id, point);
  }

  function buildBoxes(container) {
    var templateStart = '<div class="box"><div class="wrapper">';
    var templateEnd = '</div></div>';
    container.append(templateStart + templateEnd);
  }

  function updateBox(type, content, container, index) {
    var children = $(container.children());
    var box = $(children[index]);
    var wrapper = $(box.children()[0]);
    wrapper.empty();
    wrapper.append(content);
    box.removeClass();
    box.addClass('box');
    box.addClass(type);
  }

  function calculateBoxesPerSection(sectionClass) {
    var boxSize = 150 + 30; //150 is box width, 24 is total left/right margins & an extra 6 to prevent overflow
    var wideBoxes = $(sectionClass).width() / boxSize;
    var tallBoxes = $(sectionClass).height() / boxSize;
    return parseInt(wideBoxes * tallBoxes);
  }

  function updateCounter(number, container) {
    container.empty();
    for(var index = 0; index < number.length; index++) {
      container.append('<li>' + number.charAt(index) + '</li>');
    }
  }

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   */
  function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
  }

  update();
  setInterval(update, 30 * 1000);

});
