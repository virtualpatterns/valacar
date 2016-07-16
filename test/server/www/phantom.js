var Page = require('webpage');

var page = Page.create();

page.onConsoleMessage = function(message) {
    console.log(message);
};
page.onError = function(message, trace) {
    console.log(message);
};
page.onCallback = function(message) {
    console.log(message.failures);
    setTimeout(function() {
      page.render('phantom.png');
      phantom.exit(0);
    }, 10000);
};

// page.onResourceRequested = function(requestData, networkRequest) {
//   console.log('Request (#' + requestData.id + '): ' + JSON.stringify(requestData));
// };

page.open('http://dumbledore.local:31470/www/test.html', function(status) {
    if (status === "success") {
      page.injectJs('object-assign.js');
    }
    else {
        phantom.exit(1);
    }
});
