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
    './states/index'
], function (ng) {
    'use strict';

    return ng.module('ttkd', [
        'ttkd.controllers',
        'restangular',
        'ttkd.directives',
        'ttkd.services',
        'ttkd.states',
        'ui.bootstrap',
        'ui.bootstrap.tpls',
        'ui.router',
    ]).config(['$locationProvider',
        function($locationProvider) {

            $locationProvider.html5Mode(true).hashPrefix('!');

        }
    ]).run(function($state, $rootScope, RestangularProvider) {

        RestangularProvider.setBaseUrl('/api');

        $state.go('management');
    });
});
