var slideLoopId;

// For dev'in and test'in
function stopSlideLoop() {
  clearTimeout(slideLoopId);
}

$(document).on('ready', function() {

  var counter = new flipCounter('counter', {
      value: 0,
      inc: 1,
      pace: 1000,
      auto: false
  });

  $('.box-container').each(function(index) {
    var totalBoxes = calculateBoxesPerSection('.box-container');
    console.log(totalBoxes);
    for(var index = 0; index < totalBoxes; index++) {
      buildBoxes($(this));
    }
  });

  var slides = ['slide-dosomething', 'slide-counts', 'slide-campaigns', 'slide-reportbacks', 'slide-members', 'slide-ctl'];
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
  }

  function updateCTLCount() {
    $.get('/module/counters/ctl', function(data) {
      $('#ctl-messages').text(data.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    });
  }

  function updateDosomethingCount() {
    $.get('/module/counters/dosomething', function(data) {
      counter.setValue(data.toString().replace(/,/g, ''));
    });
  }

  function updateStaffPick() {
    $.get('/module/campaigns/staff-pick', function(data) {
      $('#campaign__title').text(data.title);
      $('#campaign__image').attr('src', data.image);
      $('.sign-ups').text(data.signups);
      $('.days-left').text(data.daysLeft);
      updateReportbacks(data.nid);
    });
  }

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
        updateBox('reportback-image', image, $('.slide-reportbacks'));
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

  function buildBoxes(container) {
    var templateStart = '<div class="box"><div class="wrapper">';
    var templateEnd = '</div></div>';
    container.append(templateStart + templateEnd);
  }

  function updateBox(type, content, container) {
    var box = $(container.children()[Math.floor(Math.random()*container.children().length)]);
    var wrapper = $(box.children()[0]);
    wrapper.empty();
    wrapper.append(content);
    box.removeClass();
    box.addClass('box');
    box.addClass(type);
  }

  function calculateBoxesPerSection(sectionClass) {
    var boxSize = 150 + 24; //150 is box width, 24 is total left/right margins
    var wideBoxes = $(sectionClass).width() / boxSize;
    var tallBoxes = $(sectionClass).height() / boxSize;
    return parseInt(wideBoxes * tallBoxes);
  }

  update();
  setTimeout(update, 60 * 1000);

});
