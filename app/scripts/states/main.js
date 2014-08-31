/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['./module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('login', {
            url: '/login',
            templateUrl: 'partials/management/loginlogout/login',
            controller: function($state) {
                
            }
        });

        $stateProvider.state('dashboard', {
            url: '/dashboard',
            templateUrl: 'partials/management/dashboard',
            controller: function($state) {
                
            }
        });

        $stateProvider.state('students', {
            url: '/students',
            templateUrl: 'partials/management/students',
            controller: function($state) {
                
            }
        });

        $stateProvider.state('programs', {
            url: '/programs',
            templateUrl: 'partials/management/programs',
            controller: function($state) {
                
            }
        });

        $stateProvider.state('workshops', {
            url: '/workshops',
            templateUrl: 'partials/management/workshops',
            controller: function($state) {
                
            }
        });

        $stateProvider.state('payments', {
            url: '/payments',
            templateUrl: 'partials/management/payments',
            controller: function($state) {
                
            }
        });

        $stateProvider.state('attendance', {
            url: '/attendance',
            templateUrl: 'partials/management/attendance',
            controller: function($state) {
                
            }
        });

        $stateProvider.state('reporting', {
            url: '/reporting',
            templateUrl: 'partials/management/reporting',
            controller: function($state) {
                
            }
        });
    }]);
});