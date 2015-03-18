$(document).on('ready', function() {

  // Initializing the plugin that is used for the slides
  $('.fullpage').fullpage({
      resize: false,
      loopBottom: true,
      easing: 'easeInOutQuart',
      scrollingSpeed: 1000,
      navigation: false
  });

  var counter = new flipCounter('counter', {
      value: 0,
      inc: 1,
      pace: 1000,
      auto: false
  });

  function update() {
    updateCTLCount();
    updateDosomethingCount();
    var nid = updateStaffPick();
    updateReportbacks(nid);
    updateFeaturedMembers();
  }

  function updateCTLCount() {
    $.get('/module/counters/ctl', function(data) {
      $('#ctl-messages').text(data.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    });
  }

  function updateDosomethingCount() {
    $.get('/module/counters/dosomething', function(data) {
      counter.setValue(data.total);
    });
  }

  function updateStaffPick() {
    $.get('/module/campaigns/staff-pick', function(data) {
      $('#campaign-title').text(data.title);
      $('#campaign-image').attr('src', data.image);
      $('.sign-ups').text(data.signups);
      $('.days-left').text(data.daysLeft);
      return data.nid;
    });
  }

  function updateReportbacks(nid) {
    $('/module/campaigns/reportbacks/' + nid, function(data) {

    });
  }

  function updateFeaturedMembers() {

  }

  setTimeout(function() {
    $.fn.fullpage.moveSectionDown();
  }, 5000);

  update();
  setTimeout(update, 60 * 1000);

});
