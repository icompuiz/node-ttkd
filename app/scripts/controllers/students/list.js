define(['../module'], function(controllers) {
    'use strict';

    controllers.controller('ListStudentCtrl', ['$scope', '$http', '$log', '$state', 'StudentSvc',
        function($scope, $http, $log, $state, StudentSvc) {
            $scope.filterOptions = {
                filterText: '',
                useExternalFilter: true
            };

            $scope.totalServerItems = 0;
            $scope.pagingOptions = {
                pageSizes: [250, 500, 1000],
                pageSize: 250,
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

            $scope.getPagedDataAsync = function (pageSize, page, searchText) {
                setTimeout(function () {
                    var data = {};

                    StudentSvc.list().then(function(students){
                        // add students to new array for ng-grid outputting
                        _(students).forEach(function(student){
                            data.push({
                                'Student_name': student.firstName 
                            })
                        });



                        $scope.setPagingData(data,page,pageSize);
                    });
                    
/*
                    if (searchText) {
                        var ft = searchText.toLowerCase();
                        $http.get('jsonFiles/largeLoad.json').success(function (largeLoad) {
                            data = largeLoad.filter(function(item) {
                                return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
                            });

                            $scope.setPagingData(data,page,pageSize);
                        });
                    } else {
                        $http.get('jsonFiles/largeLoad.json').success(function (largeLoad) {
                            $scope.setPagingData(largeLoad,page,pageSize);
                        });
                    }
*/
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
                enablePaging: true,
                showFooter: true,
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions
            };
        }
    ]);
});