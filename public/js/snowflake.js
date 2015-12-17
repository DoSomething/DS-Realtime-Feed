$(document).on('ready', function() {
  buildSnowflake();

  setInterval(function() {
    buildSnowflake();
  }, 1000);
});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildSnowflake() {
  var $snowflake = $('<p class="snowflake animated fadeOutDownBig">&#10052;</p>');
  $snowflake.css("left", getRandomInt(0, $(document).width()));
  $('body').append($snowflake);
}
