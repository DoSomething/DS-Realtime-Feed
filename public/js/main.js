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

  var slides = ['slide_dosomething', 'slide_counts', 'slide_campaigns', 'slide_members', 'slide_ctl'];
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
      $('#campaign-title').text(data.title);
      $('#campaign-image').attr('src', data.image);
      $('.sign-ups').text(data.signups);
      $('.days-left').text(data.daysLeft);
      updateReportbacks(data.nid);
    });
  }

  function updateReportbacks(nid) {
    $.get('/module/campaigns/reportbacks/' + nid, function(data) {

    });
  }

  function updateFeaturedMembers() {
    $.get('/data/featured_members.json', function(data) {
      var members = data.members;
      console.log(members[0]);
      $('.member').each(function(index) {
        var chosenMember = members[Math.floor(Math.random()*members.length)]; //Its the chosen one!
        console.log(chosenMember);
        members.splice(members.indexOf(chosenMember), 1);
        $(this).find('h2').text(chosenMember.title);
        $(this).find('h3').text(chosenMember.subtitle);
        $(this).find('p').text(chosenMember.copy);
        $(this).find('img').attr('src', chosenMember.photo_url);
      });
    });
  }

  update();
  setTimeout(update, 60 * 1000);

});
