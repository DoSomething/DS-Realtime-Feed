var slideLoopId;

// For dev'in and test'in
function stopSlideLoop() {
  clearTimeout(slideLoopId);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var randomLetters = ["ﾑ", "ﾒ", "ﾓ", "ﾔ", "ｽ", "ｿ", "ｯ", "ﾊ"];
function createFallingLetter() {
  $letter = $('<p class="falling-text animated-coke bounceOutDownCoke"></p>');
  $letter.text(randomLetters[Math.floor(Math.random()*randomLetters.length)]);
  $letter.css('left', getRandomInt(20, $(window).width() - 20) + 'px');
  $('body').append($letter);
  $letter.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
    $(this).remove();
  });
}

$(document).on('ready', function() {

  var slides = ['slide-dosomething', 'slide-coke'];
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

  // Falling Letters
  setInterval(createFallingLetter, .5 * 1000);

});
