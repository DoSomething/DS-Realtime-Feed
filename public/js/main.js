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

  // Used for the member map, converts alpha 2 ISO to alpha 3
  var codes = {};
  Papa.parse('/data/ISOCodes.csv', {
    download: true,
    complete: function(results) {
      var rawData = results.data;
      rawData.forEach(function(element, index, array) {
        codes[element[0]] = element[1];
      });
    }
  });

  var socket = io.connect(location.host);
  socket.on('event', function(data) {
    handleUserEvent(data);
  })

  var slides = ['slide-dosomething', 'slide-feed', 'slide-counts', 'slide-campaigns', 'slide-reportbacks', 'slide-members', 'slide-map', 'slide-ctl', 'slide-tmi'];
  var slideIndex = 0;

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

  function update() {
    updateCTLCount();
    updateDosomethingCount();
    updateStaffPick();
    updateFeaturedMembers();
    updateMemberMap();
  }

  function updateCTLCount() {
    $.get('/module/counters/ctl', function(data) {
      $('#ctl-messages').text(data.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    });
  }

  function updateDosomethingCount() {
    $.get('/module/counters/dosomething', function(data) {
      var rawVal = data.toString().replace(/,/g, '');
      updateCounter(rawVal, $('#member_counter'));
    });
  }

  function updateStaffPick() {
    $('.campaign-block').each(function() {
      var block = $(this);
      $.get('/module/campaigns/random-campaign', function(data) {
        if(data.title == undefined) {
          updateStaffPick();
          return;
        }
        block.find('h1').text(data.title);
        block.find('img').attr('src', data.image);
        if(!data.staffpick) {
          block.find('p').hide();
        }
        else{
          block.find('p').show();
        }
        updateReportbacks(data.nid);
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

  function updateMemberMap() {
    $('#map_container').empty();
    Papa.parse('/data/members_by_country.csv', {
      download: true,
      complete: function(results) {
        var rawData = results.data;
        var data = {};
        for(var index = 1; index <= rawData.length; index++) { //Skip the first row
          if(rawData[index] == undefined || rawData[index][0] == ""){
            continue;
          }
          var fill = "veryLight";
          var totalMembers = parseInt(rawData[index][1].split(',').join(' ').replace(/ /g,''));
          if(totalMembers == 0) {
            continue;
          }
          if(totalMembers >= 10000) {
            fill = "veryHeavy";
          }
          else if(totalMembers >= 5000) {
            fill = "heavy";
          }
          else if(totalMembers >= 1000) {
            fill = "medium";
          }
          else if(totalMembers >= 500) {
            fill = "light";
          }
          var rawISO = rawData[index][0];
          data[codes[rawISO]] = {fillKey: fill};
        }
        map = new Datamap({
          element: document.getElementById("map_container"),
          projection: 'mercator',
          fills: {
            defaultFill: '#EDEAEF',
            veryLight: "#836B92",
            light: "#715582",
            medium: "#604073",
            heavy: "#4e2b63",
            veryHeavy: "#3E224F"
          },
          data : data
        });
      }
    });
  }

  var userBoxIndex = 0;
  function handleUserEvent(data) {
    console.log(data);
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

  update();
  setTimeout(update, 60 * 1000);

});
