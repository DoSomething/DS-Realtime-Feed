# DoSomething.org Real Time Activity Feed

This project displays activity across the DoSomething.org web and mobile services.

## Installation - BlackAngus Server (DoSomething.org Office)

### Connect

SSH into the Black Angus server under your account. Once you're logged in,

```
sudo -s
cd /var/www/lobby/
```

### Git

(This is to make sure the code remains in the `/lobby/` folder and not `/lobby/mbc-activityStats/`.)

```
git init
git remote add origin git@github.com:DoSomething/mbc-activityStats.git
git fetch
git reset --hard origin/master
```

### Install

Install Node dependencies:

```
npm install
```

Install [forever](https://github.com/nodejitsu/forever):

```
npm install forever -g
```

Install VPNC:

```
yum install vpnc
```

### Configuration

Download the application configurations from the DoSomething.org tech wiki:

```
wget <link>
unzip config.zip
rm -rf config.zip
```

Configure VPNC, get the details from the tech wiki (Servers > Rackspace > Accessing your environment):

```
cp /etc/vpnc/default.conf /etc/vpnc/dashboard.conf
nano (or editor of choice) dashboard.conf
```
If in Nano
```
  cntrl+x
  y
  enter
```

Create base member count file
```
cd /var/www/lobby
touch count.json
nano count.json
{"total":2593579}
```

Edit the file to look like this, values are in the same order listed in the [wiki](https://sites.google.com/a/dosomething.org/tech/server/rackspaceprivatecloud-openstack/original-welcome-message?pli=1):

```
IPSec gateway 98.xxx.xxx.xxx (replace with actual IP)
IPSec ID <redacted>
IPSec secret <redacted>
Xauth username <redacted>
Xauth password <redacted>
```

### Run

```
cd /var/www/lobby
vpnc dashboard.conf
forever start index.js
```

### Deploying, Logs and Maintenance

Deploying:

```
cd /var/www/lobby
git pull origin master
forever restart index.js
```

Logs:

```
forever logs index.js
```

Restarting:
```
vpnc-disconnect
vpnc dashboard.conf
forever restart index.js
```

Command reference:

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

Next, make sure you download the dashboard config files from <link> and place them in the mbc-activityStats directory. Also create a count.json file and put the following in it:
```
{"total":2593579}
```

Finally, run:

```
node index.js
open http://localhost:3000
```
