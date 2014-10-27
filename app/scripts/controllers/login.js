'use strict';

define(['./module'], function(controllers) {

    controllers.controller('LoginCtrl', ['$scope', '$http', '$log', '$state', 'AuthenticationSvc', function($scope, $http, $log, $state, AuthenticationSvc) {

        $scope.statusMessage = '';

        function continueToHomePage() {
            if (AuthenticationSvc.authorize('users::admin')) {
                $state.go('admin.dashboard.home');
            } else if (AuthenticationSvc.authorize('users::checkinusers')) {
                $state.go('checkin');
            }
        }

        $scope.submit = function() {

            AuthenticationSvc.login({
                username: $scope.username,
                password: $scope.password
            }).then(function() {
                    continueToHomePage();
                },
                function(error) {

                    $scope.statusMessage = error.data.replace('Unauthorized: ', '');
                });
        };
        if (AuthenticationSvc.isLoggedIn()) {
            continueToHomePage();
        }
    }]);

});
