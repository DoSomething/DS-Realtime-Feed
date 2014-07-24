$(function() {
    var hostname = 'http://' + location.hostname + ":" + location.port;
    var socket = io.connect(hostname);
    var picks = [];

    var current = 0;

    $('.fullpage').fullpage({
        resize: false,
        loopBottom: true,
        easing: 'easeInOutQuart',
        scrollingSpeed: 1000,
        navigation: false
    });

    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    var updateEvents = function() {
        $.ajax('/events', {
            dataType: 'json',
            type: 'GET',
            success: function(data) {
                var jsonData = JSON.parse(data);
                var current = null;
                var number = (jsonData.items.length > 3) ? 3 : jsonData.items.length;
                var events = $('#upcoming-events .tableCell .events');
                events.empty();
                for (var i = 0; i < number; i++) {
                    current = jsonData.items[i];
                    if (typeof current.location === 'undefined') {
                        current.location = 'No Location Given'
                    }
                    var color = boxColors[getRandomInt(1, boxColors.length - 1)];
                    events.append('<li><div class="date"><p class="day">' + moment(current.start.dateTime).format('DD') + '</p><p class="month">' + moment(current.start.dateTime).format('MMMM') + '</p><p class="time">' + moment(current.start.dateTime).format('h:mm A') + ' to ' + moment(current.end.dateTime).format('h:mm A') + '</p></div><div class="info"><h2>' + current.summary + '</h2><p class="location">' + current.location + '</p></div></li>').find('li').last().css({
                        background: color.background,
                        color: color.text
                    }).find('.date').css({
                        "border-right": '2px solid ' + color.text
                    });
                }
            }
        });
        $.ajax('/staff-picks', {
          type: 'GET',
          success: function(data){
            var picks = JSON.parse(data);
            var random = picks[getRandomInt(0, picks.length - 1)];
            $('#campaign-title').text(random.title);
            $('#campaign-image').attr('src', random.imageURL);
            $('.sign-ups').text(random.signups);
            $('.days-left').text(random.daysLeft);
          }
        });
    };

    updateEvents();

    setInterval(updateEvents, 3600000); // 3600000 milliseconds is 1 hour

    var boxes = $('.box');
    var boxMargin = 5;
    var boxWidth = 200;
    var container = $('#feed .tableCell');
    var maxBoxes = 0;
    var animation = 'flipInX';
    var slideTimes = [10000, 20000, 10000, 10000, 10000];
    var boxColors = [
        {
            "name": "text",
            "background": "#444444",
            "text": "#ffffff"
        },
        {
            "name": "signup",
            "background": "#23b7fb",
            "text": "#ffffff"
        },
        {
            "name": "report back",
            "background": "#4e2b63",
            "text": "#fcd116"
        },
        {
            "name": "campaign",
            "background": "#fcd116",
            "text": "#4e2b63"
        }
    ];

    var setMaxBoxes = function() {
        boxes = $('.box');
        var divisor = boxWidth + boxMargin * 2;
        maxBoxes = Math.floor(container.width() / divisor) * Math.floor($(window).height() / divisor);
        if (boxes.length > maxBoxes) {
            boxes.slice(-(boxes.length - maxBoxes)).slideUp(400, function() {
                $(this).remove();
            });
        }
    };

    setMaxBoxes();

    $(window).on('resize', setMaxBoxes);

    var createBox = function(text, colors, imgElement) {
        boxes = $('.box');

        var element = $('<div class="box"></div>').css({
            background: colors.background,
            color: colors.text
        });

        if(imgElement){
          element.addClass('image').append($(text));
        }
        else{
          element.append('<span></span>').find('span').append(text);
        }

        setMaxBoxes();

        if (boxes.length >= maxBoxes) {
            if (boxes.length > maxBoxes) {
                boxes.slice(-(boxes.length - maxBoxes)).slideUp(400, function() {
                    $(this).remove();
                });
            }

            boxes.eq(getRandomInt(0, boxes.length - 1)).replaceWith(element);
        }
        else {
            container.append(element);
        }
        $(element).addClass('animated ' + animation);
        $(element).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(element).removeClass(animation);
        });
    };

    socket.on('text', function(msg) {
        createBox(msg, boxColors[1], false);
    });

    socket.on('signup', function(msg) {
        createBox(msg, boxColors[2], false);
    });

    socket.on('report back', function(msg) {
        createBox(msg, boxColors[0], false);
    });

    socket.on('report back image', function(msg) {
        createBox(msg, boxColors[0], true);
    });

    socket.on('campaign', function(msg) {
        createBox(msg, boxColors[3], false);
    });

    // https://github.com/cnanney/css-flip-counter
    var counter = new flipCounter('counter', {
        value: 0,
        inc: 1,
        pace: 1000,
        auto: false
    });

    socket.on('ticker', function (text) {
        counter.setValue(text);
    });

    (function loop() {
	setTimeout(function() {
	    $.fn.fullpage.moveSectionDown();
	    current = ((current + 1) > slideTimes.length - 1) ? 0 : current + 1;
	    loop();
	}, slideTimes[current]);
    })();
});
