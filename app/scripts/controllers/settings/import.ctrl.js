define(['../module'], function(controllers) {

    controllers.controller('DataImportCtrl', ['$scope', '$http', '$log', '$state', 'FileUploader', function($scope, $http, $log, $state, FileUploader) {

        $scope.results = {
            errors: [],
            imported: []
        }

        $scope.uploader = new FileUploader({
            url: '/api/import',
            queueLimit: 1,
            removeAfterUpload: true
        });

        $scope.uploader.onCompleteItem = function(item, response, status, headers) {

            $scope.results = response;

        };


        $scope.clearQueue = function() {
        	$scope.uploader.clearQueue();
        };

    }]);

});
