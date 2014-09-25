define(['../module'], function(controllers) {
    'use strict';

    controllers.controller('ListStudentCtrl', ['$scope', '$http', '$log', '$state', '$filter', 'StudentSvc',
        function($scope, $http, $log, $state, $filter, StudentSvc) {
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

                    StudentSvc.list().then(function(students){
                        // add students to new array for ng-grid outputting
                        _(students).forEach(function(student){
                            // data.push({
                            //     'firstName': student.firstName,
                            //     'lastName': student.lastName,
                            //     'age': $filter('age')(student.birthday),
                            //     '_id': student._id
                            // })
                            data.push(student);
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
                sortInfo: { fields: ['lastName', 'firstname'], directions: ['asc', 'asc'] },
                columnDefs: [
                    { cellTemplate: '/partials/students/list/studentAvatar', sortable: false, width: 70, height: 70, cellClass: 'grid-student-list-icon-cell' },
                    { field: 'firstName', displayName: 'First Name' },
                    { field: 'lastName', displayName: 'Last Name' },
                    { field: 'age', displayName: 'Age' },
                    { cellTemplate: '/partials/students/list/optionsButton', sortable: false },
                ]
            };

            $scope.edit = function(row){
                console.log('Edit student id: ' + row.entity._id);
                $state.go('admin.students.edit', {id: row.entity._id});
            };

            $scope.view = function(row){
                console.log('View student id: ' + row.entity._id);
                $state.go('admin.students.view', {id: row.entity._id});
            };

            $scope.removeDisabled = function() {
                return $scope.gridOptions.selectedItems.length === 0;
            };

            $scope.remove = function() {
                $scope.showRemoveConfirm = true;
            };



            $scope.confirmRemove = function(remove) {
                if(remove) {
                    $log.log('Removing selected students...');

                    _($scope.gridOptions.selectedItems).forEach(function(student) {
                        $log.log(' |_ Removing student: ' + student.firstName + ' ' + student.lastName + ' ' + student._id);
                        removeStudentData(student);
                    });

                    // empty selection
                    $scope.gridOptions.selectedItems.length = 0;

                    $scope.showRemoveConfirm = false;
                } else {
                    $scope.showRemoveConfirm = false;
                }
            };

            $scope.showRemoveConfirm = false;


            function removeStudentData(student) {
                //Remove Student
                StudentSvc.read(student._id, null, true).then(function() {
                    StudentSvc.remove().then(function() {
                        $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                        StudentSvc.reset();
                    });
                });
            }
        }
    ]);
});