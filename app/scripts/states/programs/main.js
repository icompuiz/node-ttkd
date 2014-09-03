/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
		$stateProvider.state('admin.programs', {
            url: '',
            abstract: true,
            views: {
            	'application-body': {
            		templateUrl: 'partials/programs/index',
            		controller: function() {}
            	}
            }
        });
        
        $stateProvider.state('admin.programs.home', {
            url: '/programs',
            views: {
            	'section-body': {
            		templateUrl: 'partials/programs/home',
            		controller: 'ProgramsCtrl'
            	}
            }
        });
    }]);

});