var drupal = require(`${__dirname}/drupal`);

var reportbacks = ['', '', '', '', '', ''];

function getReportbacks() {
  drupal.get('reportback-items', {random: true, count: 6}, function(data) {
    data.data.forEach(function(rb, index) {
      reportbacks[index] = rb.media.uri;
    });

    setTimeout(function() {
      getReportbacks();
    }, 6 * 1000);
  });
}
exports.getReportbacks = getReportbacks;

exports.fetch = function() {
  return reportbacks;
}
