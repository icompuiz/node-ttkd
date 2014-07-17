define(['./module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('management.controlpanel', {
            url:'/management/controlpanel',
            templateUrl: 'partials/management/controlpanel/index',
            controller: function() {}
        });

    }]);
});