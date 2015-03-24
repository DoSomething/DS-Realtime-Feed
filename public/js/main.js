$(document).on('ready', function() {

  var counter = new flipCounter('counter', {
      value: 0,
      inc: 1,
      pace: 1000,
      auto: false
  });

  var slides = ['slide_dosomething', 'slide_counts', 'slide_campaigns', 'slide_ctl'];
  var slideIndex = 0;

  setInterval(function slideUpdate() {
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

  }

  setTimeout(function() {
    //move page down
  }, 5000);

  update();
  setTimeout(update, 60 * 1000);

});
