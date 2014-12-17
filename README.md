Running the application

1) Install dependencies

In the application source directory.

Run `npm install -g grunt-cli`
Run `npm install -g node-windows`
Run `npm install -g bower`

Run `npm install` in order to install all node dependencies
Run `bower install` in order to install all client dependencies

1) Run the application as standalone

Run `node server`


1.a) Initialize the application database (required the for the first run)

Run `node server --initdb`

2) Run under grunt

Run `grunt serve`

3) Install as a Windows service

Requires that node-windows is installed (https://github.com/coreybutler/node-windows)

Run `node service --install`

(The service will be installed as TTKD SMA)

3.a) Other options

--stop 

Stop the service

--remove

Uninstall the Windows service

--start

Start the Windows service if stopped

A) Command line options

--initdb

Initialize the application database. Must be run the first time the application is run.

--firstrun

Will initialize the application database if the application has never been run.

--init-users

Will only reset/load the users collection

--init-assets

Will only reset/load the routes collection. Must be run if a new route has been added to the system

--stop 

Stop the application. Processed last. Used with other other command line options.

B) Tips

In order to add a new route. If you are getting an Permission For Route Not Found Error

1) Register the route in the routeData.js file

2) Add the route the the server/data/assets.js file and specify the permissions

C) Configuration File

The application configuration file can be found at "server/configuration/config.json"

1) port

specify an application port other than 9000

2) db

Configure the mongodb connection

3) test

Configure the mongodb test db connection

4) security

Configure the session security information

