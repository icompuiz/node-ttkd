/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['./module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('admin', {
            url: '/admin',
            templateUrl: 'partials/adminBase',
            controller: function($rootScope, $state, AuthenticationSvc) {

                if (!AuthenticationSvc.isLoggedIn()) {
                    $state.go('login');
                } else {
                    if ($state.current.name === 'admin') {
                        $state.go('admin.dashboard.home');
                    }
                }
            }
        });

    }]);
});