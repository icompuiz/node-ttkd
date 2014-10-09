/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('admin.reporting', {
            url: '',
            abstract: true,
            views: {
            	'application-body': {
            		templateUrl: 'partials/reporting/index',
            		controller: function() {}
            	}
            }
        });
        
        $stateProvider.state('admin.reporting.home', {
            url: '/reporting',
            views: {
            	'section-body': {
            		templateUrl: 'partials/reporting/home',
            		controller: 'ReportingCtrl'
            	}
            }
        });
    }]);

});