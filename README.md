# Message Broker - Consumer
==============
**activityStatsQueue**

# Real Time Activity Feed
==============
The real time activity feed shows activity across the DoSomething web & mobile services

![Concept Photo](https://trello-attachments.s3.amazonaws.com/512d12ee7b27cd4d4000056b/538f3d366dd60ca57bbcb1be/1279x718/257850dc36e6175956700fc31629d5a3/Screen_Shot_2014-06-23_at_3.52.29_PM.png)

## Installation - BlackAngus server (DS Office)

### Connect
SSH into the Black Angus server under your account
Once logged,
```
sudo -s
cd /var/www/lobby/
```

### Git
(This is to make sure the code remains in the /lobby folder and not /lobby/mbc-activityStats)
```
git init
git remote add origin git@github.com:DoSomething/mbc-activityStats.git
git fetch
git reset --hard origin/master
```

### Install
Install node modules
```
npm install
```

Install Forever
```
npm install forever -g
```

Install VPNC
```
yum install vpnc
```

### Configuration
Download the application configurations, get the link from the tech wiki
```
wget <link>
unzip config.zip
rm -rf config.zip
```

Configure vpnc, get details from the tech wiki
(Servers > Rackspace > Accessing your environment)
```
cp /etc/vpnc/default.conf /var/www/lobby
cd /var/www/lobby
nano (or editor of choice) default.conf
```

Edit the file to look like this, values are in the same order listed in the [wiki](https://sites.google.com/a/dosomething.org/tech/server/rackspaceprivatecloud-openstack/original-welcome-message?pli=1)
```
IPSec gateway 98.xxx.xxx.xxx (replace with actual IP)
IPSec ID <redacted>
IPSec secret <redacted>
Xauth username <redacted>
Xauth password <redacted>
```
If in Nano
```
  cntrl+x
  y
  enter
```

### Run
```
cd /var/www/lobby
vpnc default.conf
forever start index.js
```

### Deploying, Logs and Maintenance
Deploying
```
cd /var/www/lobby
git pull origin master
forever restart index.js
```

Logs
```
forever logs index.js
```

Command reference
```
forever --help
```

## Installation - Local Machine

First, follow the instructions located on the tech wiki [here](https://sites.google.com/a/dosomething.org/tech/server/rackspaceprivatecloud-openstack/original-welcome-message?pli=1) to set up VPN access for your computer. This will allow the Dashboard to connect to RabbitMQ and parse the user information that is provided by it.
Next, run the following in your terminal:

```
git clone https://github.com/DoSomething/mbc-activityStats.git
cd mbc-activityStats
npm install
```

Next, make sure you download the dashboard config files from <link> and place them in the mbc-activityStats directory.

Finally, run:

```
node index.js
open http://localhost:3000
```
