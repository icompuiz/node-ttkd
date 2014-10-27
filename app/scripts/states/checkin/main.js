/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('checkin', {
            url: '/checkin',
            // abstract: true,
      		templateUrl: 'partials/checkin/index',
            controller: function($state) {
                $state.go('checkin.home');
            }
        });
        
        $stateProvider.state('checkin.home', {
            url: '/home',
            views: {
            	'section-body': {
            		templateUrl: 'partials/checkin/home',
            		controller: 'CheckinCtrl'
            	}
            }
        });

    }]);

});