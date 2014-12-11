define(['../module'], function(controllers) {
    'use strict';
    controllers.controller('DataExportCtrl', ['$scope', '$window', function($scope, $window) {

        $scope.exportStudents = function() {
            $window.open('/api/export/students', '_blank');
        };
        $scope.exportProgram = function() {
            $window.open('/api/export/programs', '_blank');
        };
        $scope.exportClass = function() {
            $window.open('/api/export/classes', '_blank');
        };
        $scope.exportWorkshop = function() {
            $window.open('/api/export/workshops', '_blank');
        };
        $scope.exportAttendance = function() {
            $window.open('/api/export/attendance', '_blank');
        };
        $scope.exportRank = function() {
            $window.open('/api/export/ranks', '_blank');
        };



    }]);

});
