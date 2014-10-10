var Service = require('node-windows').Service;
var path = require('path');
var argv = require('optimist').argv;

var serverPath = path.join(__dirname, 'server.js');

// Create a new service object
var svc = new Service({
	name: 'TTKD SMA',
	description: 'This is the ttkd student management application service.',
	script: serverPath
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {
	console.log('Service has been installed, starting it');
	svc.start();
});

svc.on('alreadyinstalled', function() {
	console.log('Service is already installed, removing it')
	svc.uninstall();
});

svc.on('uninstall', function() {
	console.log('Service has been removed')
	// svc.install();
});

svc.on('start', function() {
	console.log('Service has been started successfully');
});

svc.on('stop', function() {
	console.log('Service has been stopped successfully');
});

svc.on('error', function() {
	console.log('There was an error starting the service');
});

if (argv.stop) {
	svc.stop();
} else if (argv.remove) {
	svc.uninstall();
} else if (argv.install) {
	svc.install();
} else if (argv.start) {
	svc.start();
}
