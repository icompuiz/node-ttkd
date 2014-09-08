/**
 * loads sub modules and wraps them up into the main module
 * this should be used for top-level module definitions only
 */
define('app', [
    'angular',
    'angular-ui-router',
    'angular-bootstrap',
    // 'text!',
    'restangular',
    './controllers/index',
    './directives/index',
    './services/index',
    './factories/index',
    './states/index'
], function(ng) {
    'use strict';

    return ng.module('ttkd', [
        'restangular',
        'ttkd.controllers',
        'ttkd.directives',
        'ttkd.services',
        'ttkd.factories',
        'ttkd.states',
        'ui.bootstrap',
        'ui.bootstrap.tpls',
        'ui.router',
    ]).config(['$locationProvider',
        function($locationProvider) {

            $locationProvider.html5Mode(true).hashPrefix('!');

        }
    ]).run(function($state, $rootScope, Restangular) {

        Restangular.setBaseUrl('/api');

        Restangular.setRestangularFields({
            id: "_id",
        });

        $state.go('login');
    });
});
