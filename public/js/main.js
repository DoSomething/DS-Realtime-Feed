$(function() {
    var socket = io.connect('http://localhost:3000');

    $('.wrapper').fullpage({
        resize: false,
        loopBottom: true,
        easing: 'easeInOutQuart',
        scrollingSpeed: 1000,
        navigation: true
    });

    var updateEvents = function() {
        $.ajax('/events', {
            dataType: 'json',
            type: 'GET',
            success: function(data) {
              var jsonData = JSON.parse(data);
                var current = null;
                for (var i = 0; i < jsonData.items.length; i++) {
                    current = jsonData.items[i];
                    $('#upcoming-events .tableCell .events').append('<li><div class="date"><p class="day">' + moment(current.start.dateTime).format('DD') + '</p><p class="month">' + moment(current.start.dateTime).format('MMMM') + '</p><p class="time">' + moment(current.start.dateTime).format('h:mm A') + ' to ' + moment(current.end.dateTime).format('h:mm A') + '</p></div><div class="info"><h2>' + current.summary + '</h2><p class="location">' + current.location + '</p></div></li>');
                }
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
    var slideTimes = [2000, 10000, 2000, 2000, 2000];
    var current = 0;
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

    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

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

    var createBox = function(text) {
        var colors = boxColors[getRandomInt(0, boxColors.length - 1)];
        boxes = $('.box');

        var element = $('<div class="box"></div>').css({
            background: colors.background,
            color: colors.text
        });
        element.append('<span></span>').find('span').text(text);

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
        createBox(msg);
    });

    socket.on('signup', function(msg) {
        createBox(msg);
    });

    socket.on('report back', function(msg) {
        createBox(msg);
    });

    socket.on('campaign', function(msg) {
        createBox(msg);
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

    // (function loop() {
    //     setTimeout(function() {
    //         $.fn.fullpage.moveSectionDown();
    //         current = ((current + 1) > slideTimes.length - 1) ? 0 : current + 1;
    //         loop();
    //     }, slideTimes[current]);
    // })();
});
