define(['./module'], function (states) {
    'use strict';

    return states.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $stateProvider.state('management.files', {
            url:'/management/files',
            templateUrl: 'partials/management/files/index',
            controller: function() {}
        });

    }]);
});