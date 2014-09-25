define(['../../module'], function(controllers) {
    'use strict';

    controllers.controller('CreateStudentPhotoCtrl', ['$scope', '$log', '$state', 'StudentSvc', 'FileUploader',
        function($scope, $log, $state, StudentSvc, FileUploader) {

            $scope.model = StudentSvc.current;

            if (!angular.isDefined($scope.model)) {
                $state.go("admin.students.create");
            }

            if (!angular.isDefined($scope.model.uploader)) {
                $scope.model.uploader = new FileUploader({
                    url: '/api/fs/directories/root',
                    queueLimit: 1
                });
            }

            $scope.uploader = $scope.model.uploader;

            $scope.uploader.filters.push({
                name: 'imageFilter',
                fn: function(item /*{File|FileLikeObject}*/ , options) {
                    var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            });

            // CALLBACKS

            $scope.uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/ , filter, options) {
                console.info('onWhenAddingFileFailed', item, filter, options);
            };
            $scope.uploader.onAfterAddingFile = function(fileItem) {
                console.info('onAfterAddingFile', fileItem);
            };
            $scope.uploader.onAfterAddingAll = function(addedFileItems) {
                console.info('onAfterAddingAll', addedFileItems);
            };
            $scope.uploader.onBeforeUploadItem = function(item) {
                console.info('onBeforeUploadItem', item);
            };
            $scope.uploader.onProgressItem = function(fileItem, progress) {
                console.info('onProgressItem', fileItem, progress);
            };
            $scope.uploader.onProgressAll = function(progress) {
                console.info('onProgressAll', progress);
            };
            $scope.uploader.onSuccessItem = function(fileItem, response, status, headers) {
                console.info('onSuccessItem', fileItem, response, status, headers);
            };
            $scope.uploader.onErrorItem = function(fileItem, response, status, headers) {
                console.info('onErrorItem', fileItem, response, status, headers);
            };
            $scope.uploader.onCancelItem = function(fileItem, response, status, headers) {
                console.info('onCancelItem', fileItem, response, status, headers);
            };
            $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
                console.info('onCompleteItem', fileItem, response, status, headers);
            };
            $scope.uploader.onCompleteAll = function() {
                console.info('onCompleteAll');
            };


        }
    ]);

});
