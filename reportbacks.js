var drupal = require(`${__dirname}/drupal`);

var reportbacks = ['', '', '', '', '', ''];

function getReportback(index) {
  drupal.get('reportbacks', {random: true, count: 1}, function(data) {
    if (data != undefined && data.data && data.data[0]) {
      reportbacks[index] = data.data[0].reportback_items.data[0].media.uri;
    }

    setTimeout(function() {
      getReportback(index);
    }, 6 * 1000);
  });
}

exports.fetch = function() {
  return reportbacks;
}

exports.setup = function() {
  for (var i = 0; i < 6; i++) {
    getReportback(i);
  }
}
