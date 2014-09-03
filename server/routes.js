'use strict';

var _ = require('lodash');
var path = require('path');
var async = require('async');

var routesRegistered = false;



var Authentication = require('./controllers/authenticationCtrl.js');
var Mock = require('./controllers/mock.js');
var Route = require('./controllers/route.js');
var Directory = require('./controllers/directory.js');
var File = require('./controllers/file.js');
var StudentList = require('./controllers/studentList.js');
var Achievement = require('./controllers/achievement.js');
var Attendance = require('./controllers/attendance.js');
var Class = require('./controllers/class.js');
var EmergencyContact = require('./controllers/emergencyContact.js');
var Rank = require('./controllers/rank.js');
var Student = require('./controllers/student.js');
var Program = require('./controllers/program.js');
var Workshop = require('./controllers/workshops.js');
var WorkshopAttendanceList = require('./controllers/workshopAttendanceList.js');

var Content = require('./controllers/content.js');
var ContentType = require('./controllers/contentType.js');
var InputFormat = require('./controllers/inputFormat.js');
var OutputFormat = require('./controllers/outputFormat.js');
var Template = require('./controllers/template.js');


var apiRoutes = [{
    path: '/api/mocks',
    controller: Mock
}, {
    path: '/api/fs/directories',
    controller: Directory

}, {
    path: '/api/fs/files',
    controller: File
}, {
    path: '/api/contentitems',
    controller: Content

}, {
    path: '/api/contenttypes',
    controller: ContentType
}, {
    path: '/api/inputformats',
    controller: InputFormat
}, {
    path: '/api/outputformats',
    controller: OutputFormat

}, {
    path: '/api/templates',
    controller: Template
}, {
    path: '/api/studentlists',
    controller: StudentList
}, {
    path: '/api/achievements',
    controller: Achievement
}, {
    path: '/api/attendance',
    controller: Attendance
}, {
    path: '/api/classes',
    controller: Class
}, {
    path: '/api/emergencycontacts',
    controller: EmergencyContact
}, {
    path: '/api/ranks',
    controller: Rank
}, {
    path: '/api/students',
    controller: Student
}, {
    path: '/api/programs',
    controller: Program
}, {
    path: '/api/workshops',
    controller: Workshop
}, {
    path: '/api/workshopattendancelists',
    controller: WorkshopAttendanceList
}];

var authRoutes = [{
    path: '/register',
    httpMethod: 'POST',
    middleware: [Authentication.register]
}, {
    path: '/login',
    httpMethod: 'POST',
    middleware: [Authentication.login]
}, {
    path: '/logout',
    httpMethod: 'GET',
    middleware: [Authentication.logout]
}];

var staticRoutes = [{
    path: '/partials/*',
    httpMethod: 'GET',
    middleware: function(req, res) {
        var requestedView = path.join('./', req.url);
        console.log("View::", requestedView);
        res.render(requestedView, function(err, html) {
            if (err) {
                res.render('404');
            } else {
                res.send(html);
            }
        });
    }
}, {
    path: '/',
    httpMethod: 'GET',
    middleware: function(req, res) {
        res.render('index', {
            user: req.user
        });
    },
},{
    path: '/*',
    httpMethod: 'GET',
    middleware: function(req, res) {
        res.render('index', {
            user: req.user
        });
    },
}];



function cleanRequest(req, res, next) {
    if (req.user) {
        if (req.user.salt) {
            req.user.salt = null;
        }
        if (req.user.hash) {
            req.user.hash = null;
        }
    }
    next();
}

function main(app, afterRoutesRegistered) {

    if (routesRegistered) {
        console.log('Routes have already been registered');
        return;
    }

    routesRegistered = true;

    function registerRoute(route, afterRegisterRoute) {

        console.log('Registering', route.path);

        if (!_.isArray(route.middleware)) {

            route.middleware = [route.middleware];

        }

        // route.middleware.unshift(setUser);
        route.middleware.unshift(cleanRequest);


        var args = _.flatten([route.path, route.middleware]);

        switch (route.httpMethod) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT':
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                var err = new Error('Invalid method specified for route ' + route.path);
                return afterRegisterRoute(err);
        }

        afterRegisterRoute();

    }

    function registerAuthRoutes(afterRegisterAuthRoutes) {

        async.each(authRoutes, registerRoute, afterRegisterAuthRoutes);


    }

    function registerStaticRoutes(afterRegisterStaticRoutes) {

        async.each(staticRoutes, registerRoute, afterRegisterStaticRoutes);

    }

    function registerAPIRoutes(afterRegisterAPIRoutes) {

        async.each(apiRoutes, function(route, afterRegisterRoute) {

            console.log('Registering route', route.path);

            route.controller.resource
                .before('get', Route.checkRoute)
                .before('post', Route.checkRoute);

            route.controller.register();

            route.controller.resource
                .after('get', cleanRequest)
                .after('post', cleanRequest)
                .after('put', cleanRequest)
                .after('delete', cleanRequest);

            route.controller.resource.register(app, route.path);

            afterRegisterRoute();

        }, afterRegisterAPIRoutes);

    }

    async.series({

        registerAuthRoutes: registerAuthRoutes,
        registerAPIRoutes: registerAPIRoutes,
        registerStaticRoutes: registerStaticRoutes

    }, afterRoutesRegistered);

}

module.exports = {
    apiRoutes: apiRoutes,
    authRoutes: authRoutes,
    staticRoutes: staticRoutes,
    register: main
};
