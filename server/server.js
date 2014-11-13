'use strict';

var $express = require('express'),
    $path = require('path'),
    $lodash = require('lodash'),
    $passport = require('passport'),
    $config = require('./configuration/config.json'),
    $initialize = require('./configuration/initialize.js'),
    $mongoose = require('mongoose'),
    $fs = require('fs'),
    async = require('async'),
    $argv = require('optimist').argv,
    LocalStrategy = require('passport-local').Strategy,
    $toastySession = require('./toastySession');

function hookStdout(stream) {
    var oldWrite = process.stdout.write;
    var oldErrwrite = process.stderr.write;

    process.stdout.write = (function(write) {
        return function() {
            write.apply(stream, arguments);
        };
    })(process.stdout.write);

    process.stderr.write = (function(write) {
        return function() {
            write.apply(stream, arguments);
        };
    })(process.stderr.write);

    return function() {
        process.stdout.write = oldWrite;
        process.stderr.write = oldErrwrite;
    };
}

var MongoStore = require('connect-mongo')($express);

var logpath = process.env.NODE_LOGPATH;

if (logpath) {
    console.log('logpath');
    var stream = $fs.createWriteStream(logpath, {
        flags: 'a+',
        encoding: 'utf8'
    });
    hookStdout(stream, function() {

        console.log('logpath here');
    });
}

function main(app, config, argument2, argument3) {

    var options = {};
    var callback = function() {};

    if ($lodash.isFunction(argument2)) {
        callback = argument2;
    }

    if ($lodash.isObject(argument2)) {
        options = argument2;

        if ($lodash.isFunction(argument3)) {
            callback = argument3;
        }

    }


    module.exports.app = app;

    app.use($express.logger('dev'));

    app.use($express.cookieParser(config.security.cookieSecret));

    if (config.security.sessionStore) {
        config.security.sessionStore = new MongoStore({
            url: config.security.sessionStore
        });
    }

    app.use($express.session({
        key: config.security.sessionKey,
        secret: config.security.sessionSecret,
        store: config.security.sessionStore
    })); // get this from the configuration

    app.use($express.bodyParser({
        limit: '10mb'
    }));
    app.use($express.query());
    app.use($express.methodOverride());

    app.configure('development', function() {
        app.use($express.static($path.join(__dirname, '..', '.tmp')));
    });

    app.configure(function() {

        app.set('views', $path.join(__dirname, '..', 'app', 'views'));
        app.set('view engine', 'jade');
        app.set('view options', {
            layout: false
        });



        var modelsPath = $path.join(__dirname, 'models');
        $fs.readdirSync(modelsPath).forEach(function(file) {
            require($path.join(modelsPath, file));
        });

        app.use($express.bodyParser({
            limit: '50mb'
        }));
        app.use($express.query());
        app.use($express.methodOverride());
        var User = $mongoose.model('User');

        // setup $passport authentication
        app.use($passport.initialize());
        app.use($passport.session());

        app.use($express.static($path.join(__dirname, '..', 'app')));
        app.use(app.router);


        $passport.use(new LocalStrategy(User.authenticate()));
        $passport.serializeUser(User.serializeUser());
        $passport.deserializeUser(User.deserializeUser());

        app.all('*', function(req, res, next) {

            if (!req.isAuthenticated()) {
                console.log('server::app.all::not authenticated::', 'setting current user to public');
                var userQuery = User.findOne({
                    username: 'public'
                });
                userQuery.select('_id username fullname');
                return userQuery.exec(function(err, user) {

                    if (err || !user) {
                        return res.send(500, 'Error finding public user. Request failed');
                    }

                    console.log('Making request as ', user.username);

                    $toastySession.user = user;
                    next();
                });
            }

            $toastySession.user = req.user;
            console.log('server::app.all::authenticated::', 'current user is', $toastySession.user.username);
            next();
        });

    });

    function connect(err) {

        if ($argv.stop) {
            console.log('server::connect', 'Initialization complete, the application will now exit.');
            process.exit();
            return;
        }

        function onRoutesRegistered() {

            if (options.mode === 'test') {
                return callback(app);
            }

            if (!err) {
                var port = $config.port || 9000;
                app.listen(port, function() {
                    console.log('Express server listening on port', port);
                    return callback(app);
                });
            }

        }

        var $routes = require('./routes.js');
        $routes.register(app, onRoutesRegistered);
    }

    function runSerialTasks(tasks, runSerialTasksDone) {
        async.series(tasks, function(err, results) {

            if (err) {
                console.log(err);
                return runSerialTasksDone(err);
            }

            console.log(results);

            runSerialTasksDone();
        });
    }

    function initializeUserDataTask(initializeUserDataTaskDone) {

        var $loadData = require('./data/loadData');

        console.log('server::initializeUserData', 'enter');

        var tasks = {
            removeUsers: $loadData.tasks.removeUsers,
            removeGroups: $loadData.tasks.removeGroups,
            addGroups: $loadData.tasks.addGroups,
            addUsers: $loadData.tasks.addUsers
        };

        runSerialTasks(tasks, initializeUserDataTaskDone);

    }

    function initializeAssetDataTask(initializeAssetDataTaskDone) {

        var $loadData = require('./data/loadData');

        console.log('server::initializeAssetData', 'enter');


        var tasks = {
            removeAssets: $loadData.tasks.removeAssets,
            addAssets: $loadData.tasks.addAssets
        };

        runSerialTasks(tasks, initializeAssetDataTaskDone);

    }

    function firstrunTask(firstrunTaskDone) {

        console.log('server::firstrun', 'enter');

        var RouteModel = $mongoose.model('Route');

        RouteModel.findOne({
            path: '/api/mocks'
        }, function(err, routeDoc) {

            if (err) {
                // handle error
                firstrunTaskDone(err);
            }

            if (!routeDoc) {
                console.log('server::firstrun', 'The application database has not yet been initialized. The initdb flag will be set.');
                $argv.initdb = true;
            } else {
                console.log('server::firstrun', 'The application database has already been initialized. The application will start normally.');
            }

            firstrunTaskDone();

        });
    }

    function startApplicationTask(err) {

        if (err) {
            console.log('An error occured while initializing the application', err);
            return process.exit();
        }

        if (options.initialize || $argv.initdb) {
            console.log('server::Load Data');
            var $loadData = require('./data/loadData');
            $loadData.run(connect);
        } else {
            connect();
        }
    }

    var tasks = [];

    if ($argv.firstrun) {
        tasks.push(firstrunTask);
    }
    
    if ($argv['init-users']) {
    	tasks.push(initializeUserDataTask);
    }

    if ($argv['init-assets']) {
    	tasks.push(initializeAssetDataTask);
    }


    async.series(tasks, startApplicationTask);

}

var app = $express();

module.exports = {
    run: function(onReady, options) {
        $initialize.run(function(config) {
            main(app, config, options, onReady);
        }, options);
    }
};
