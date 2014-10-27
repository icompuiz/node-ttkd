/**
 * Defines the main routes in the application. Think of this as the entry point into the module
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['../module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {


        $stateProvider.state('checkin', {
          url: '/checkin',
          templateUrl: 'partials/checkinBase',
          controller: function() {}
        });

        $stateProvider.state('checkin.home', {
            url: '',
            abstract: true,
            views: {
                'application-body': {
                    templateUrl: 'partials/checkin/index',
                    controller: function() {}
                }
            }
        });

        $stateProvider.state('checkin.home.programs', {
            url: '/home',
            views: {
                'section-body': {
                    templateUrl: 'partials/checkin/home',
                    controller: 'CheckinCtrl'
                }
            }
        });


        $stateProvider.state('checkin.home.unranked', {
            url: '/unranked/:id',
            views: {
                'section-body': {
                    templateUrl: 'partials/checkin/unranked',
                    controller: 'UnrankedCheckinCtrl'
                }
            }
        });

    }]);

});