$(function() {
    // Connect to SocketIO
    var socket = io.connect(location.host);

    // Picks array for storing staff picks returned from server
    var picks = [];

    // Variables for controlling the current slide/slide advancing
    var current = 0;
    var autoScrolling = true;
    var slideLooper = null;

    // Initializing the plugin that is used for the slides
    $('.fullpage').fullpage({
        resize: false,
        loopBottom: true,
        easing: 'easeInOutQuart',
        scrollingSpeed: 1000,
        navigation: false
    });

    // Helper get random number function
    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Function that gets events from the Lobby Dashboard Google Calendar and Staff Picks from the server
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
            success: function(data) {
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

    // Get new events and staff picks every hour
    setInterval(updateEvents, 3600000); // 3600000 milliseconds is 1 hour

    var boxes = $('.box');
    var boxMargin = 5;
    var boxWidth = 200;
    var container = $('#feed .tableCell');
    var maxBoxes = 0;
    var animation = 'flipInX';
    var slideTimes = [10000, 20000, 10000, 10000, 10000];
    var boxColors = [{
        "name": "text",
        "background": "#444444",
        "text": "#ffffff"
    }, {
        "name": "signup",
        "background": "#23b7fb",
        "text": "#ffffff"
    }, {
        "name": "report back",
        "background": "#4e2b63",
        "text": "#fcd116"
    }, {
        "name": "campaign",
        "background": "#fcd116",
        "text": "#4e2b63"
    }];

    // Calculate the maximum number of boxes that can fit on the screen
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

    // When the window is resized, calculate the maximum number of boxes that can fit on the screen again
    $(window).on('resize', setMaxBoxes);

    // If the user clicks anywhere on the page (that is not inside a box), the slides will stop autoscrolling.
    // If the user clicks inside a box, the box will disappear
    $(document).on('click', function(e) {
        var target = $(e.target);
        if (target.parents('.box').length || target.is('.box')) {
            if (target.hasClass('box')) {
                target.fadeOut(400, function() {
                    $(this).remove();
                });
            }
            else {
                target.parents('.box').fadeOut(400, function() {
                    $(this).remove();
                });
            }
            boxes = $('.box');
            setMaxBoxes();
            return;
        }
        clearTimeout(slideLooper);
        slideLooper = null;
        autoScrolling = false;
    });

    // Function to create a box on the activity feed slide
    var createBox = function(text, colors, imgElement) {
        boxes = $('.box');

        var element = $('<div class="box"></div>').css({
            background: colors.background,
            color: colors.text
        });

        if (imgElement) {
            element.addClass('image').append($(text));
        } else {
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
        } else {
            container.append(element);
        }
        $(element).addClass('animated ' + animation);
        $(element).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
            $(element).removeClass(animation);
        });
    };

    /*
    ** Create boxes based on socket events
    */
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
        $('img.lazy').lazyload({
            effect: 'fadeIn',
            load: function() {
                $(this).removeClass('lazy');
            }
        });
    });

    socket.on('campaign', function(msg) {
        createBox(msg, boxColors[3], false);
    });

    // Counter for current member ticker. Code is from https://github.com/cnanney/css-flip-counter.
    var counter = new flipCounter('counter', {
        value: 0,
        inc: 1,
        pace: 1000,
        auto: false
    });

    socket.on('ticker', function(text) {
        counter.setValue(text);
    });

    // Autoscroller
    if (autoScrolling) {
        (function loop() {
            slideLooper = setTimeout(function() {
                $.fn.fullpage.moveSectionDown();
                current = ((current + 1) > slideTimes.length - 1) ? 0 : current + 1;
                loop();
            }, slideTimes[current]);
        })();
    }
});
