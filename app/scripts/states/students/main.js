/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('admin.students', {
            url: '',
            abstract: true,
            views: {
            	'application-body': {
            		templateUrl: 'partials/students/index',
            		controller: function() {}
            	}
            }
        });
        
        $stateProvider.state('admin.students.home', {
            url: '/students',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/home',
                    controller: 'StudentsCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create', {
            url: '/students/create',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/create',
                    controller: 'StudentsCtrl'
                }
            }
        });


        $stateProvider.state('admin.students.create.basic', {
            url: '/students/create/basic',
            views: {
                'create-student-wzd-body': {
                    templateUrl: 'partials/students/create.basic',
                    controller: 'CreateStudentCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create.class', {
            url: '/students/create/class',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/create',
                    controller: 'StudentsCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create.picture', {
            url: '/students/create/picture',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/create',
                    controller: 'StudentsCtrl'
                }
            }
        });

        $stateProvider.state('admin.students.create.sign', {
            url: '/students/create/signature',
            views: {
                'section-body': {
                    templateUrl: 'partials/students/create',
                    controller: 'StudentsCtrl'
                }
            }
        });
    }]);

});