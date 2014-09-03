/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('admin.attendance', {
            url: '',
            abstract: true,
            views: {
            	'application-body': {
            		templateUrl: 'partials/attendance/index',
            		controller: function() {}
            	}
            }
        });
        
        $stateProvider.state('admin.attendance.home', {
            url: '/attendance',
            views: {
            	'section-body': {
            		templateUrl: 'partials/attendance/home',
            		controller: 'DashboardCtrl'
            	}
            }
        });

    }]);

});