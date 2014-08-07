# DoSomething.org Real Time Activity Feed

This project displays activity across the DoSomething.org web and mobile services.

# Screenshots of the Slides

## Title

![Title](https://raw.github.com/DoSomething/DS-Realtime-Feed/master/screenshots/title.png)

## Activity Feed

![Activity Feed](https://raw.github.com/DoSomething/DS-Realtime-Feed/master/screenshots/activity-feed.png)

## Member Count

![Member Count](https://raw.github.com/DoSomething/DS-Realtime-Feed/master/screenshots/member-count.png)

## Staff Picks

![Staff Picks](https://raw.github.com/DoSomething/DS-Realtime-Feed/master/screenshots/staff-picks.png)

## Upcoming Events

![Upcoming Events](https://raw.github.com/DoSomething/DS-Realtime-Feed/master/screenshots/upcoming-events.png)

## Basic management

George Bot has the capabilities to manage the node server, for detailed tech info refer to the Github project wiki.

The syntax is the following,
```
@george dsfeed <command>
```

The commands are,
deploy -> pulls the latest code from master branch and restarts server

restart-servers -> restarts the web server & monitor script

restart-vpn -> in the event the monitor script fails, this will force restart the vpn. Note, you will probably have to also restart the servers in order for them to reconnect.
