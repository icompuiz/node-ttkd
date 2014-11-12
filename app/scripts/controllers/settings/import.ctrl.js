define(['../module'], function(controllers) {

    controllers.controller('DataImportCtrl', ['$scope', '$http', '$log', '$state', 'FileUploader', function($scope, $http, $log, $state, FileUploader) {

        $scope.uploader = new FileUploader({
            url: '/api/import',
            queueLimit: 1,
            // removeAfterUpload: true
        });

        // $scope.uploader.filters.push({
        //     name: 'csvFilter',
        //     fn: function(item, options) {
        //         var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        //         return '|csv|'.indexOf(type) !== -1;
        //     }
        // });

        $scope.clearQueue = function() {
        	$scope.uploader.clearQueue();
        };

    }]);

});
