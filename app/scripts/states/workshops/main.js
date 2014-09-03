/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('admin.workshops', {
            url: '',
            abstract: true,
            views: {
            	'application-body': {
            		templateUrl: 'partials/workshops/index',
            		controller: function() {}
            	}
            }
        });
        
        $stateProvider.state('admin.workshops.home', {
            url: '/workshops',
            views: {
            	'section-body': {
            		templateUrl: 'partials/workshops/home',
            		controller: 'WorkshopsCtrl'
            	}
            }
        });

    }]);

});