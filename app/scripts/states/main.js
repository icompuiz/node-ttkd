/**
 * Defines the main routes in the application.
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['./module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('management', {
            url: '/management',
            templateUrl: 'partials/management/index',
            controller: function($state) {
                $state.transitionTo('management.login');
            }
        });

        $stateProvider.state('management.login', {
            url:'/management/login',
            templateUrl: 'partials/management/loginlogout/login',
            controller: function() {}
        });

        $stateProvider.state('management.logout', {
            url:'/management/logout',
            templateUrl: 'partials/management/loginlogout/logout',
            controller: function() {}
        });

        $stateProvider.state('management.dashboard', {
            url:'/management/dashboard',
            templateUrl: 'partials/management/dashboard',
            controller: function() {}
        });

    }]);
});