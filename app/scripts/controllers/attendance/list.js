define(['../module'], function(controllers) {
    'use strict';

    controllers.controller('ListAttendanceCtrl', ['$scope', '$http', '$log', '$state', '$filter', 'AttendanceSvc',
        function($scope, $http, $log, $state, $filter, AttendanceSvc) {
            $scope.filterOptions = {
                filterText: '',
                useExternalFilter: true
            };

            $scope.totalServerItems = 0;
            $scope.pagingOptions = {
                pageSizes: [25, 50, 100, 250, 500, 1000],
                pageSize: 25,
                currentPage: 1
            };

            $scope.setPagingData = function(data, page, pageSize){
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.myData = pagedData;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.getPagedDataAsync = function (pageSize, page) {
                setTimeout(function () {
                    var data = [];

                    AttendanceSvc.list().then(function(attendances){
                        // add attendances to new array for ng-grid outputting
                        _(attendances).forEach(function(attendance){
                            data.push(attendance);
                        });

                        $scope.setPagingData(data,page,pageSize);
                    });
                }, 100);
            };

            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            $scope.$watch('pagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);

            $scope.$watch('filterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);


            $scope.gridOptions = {
                data: 'myData',
                rowHeight: 40,
                enablePaging: true,
                showFooter: true,
                beforeSelectionChange: function (rowItem, event) {
                    // check if one of the options buttons was clicked
                    if(event.target.tagName === 'BUTTON') {
                        return false;
                    } else {
                        return true;
                    }
                },
                afterSelectionChange: function () {
                    // check if one of the options buttons was clicked
                    if($scope.gridOptions.selectedItems.length === 0) {
                        $scope.showRemoveConfirm = false;
                    }
                    return true;
                },
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                columnDefs: [
                    { field: '_id', displayName: 'ID' }
                ]
            };


        }
    ]);
});