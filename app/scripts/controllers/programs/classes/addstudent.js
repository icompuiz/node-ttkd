define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('AddStudentCtrl', ['$scope', '$state', '$stateParams', '$log', 'Restangular', 'ClassSvc', 'StudentSvc',
		function($scope, $state, $stateParams, $log, Restangular, ClassSvc, StudentSvc) {
			$scope.currentClass = {};

			if (ClassSvc.current && ClassSvc.editing) {
				$scope.currentClass = ClassSvc.current;
			} else if ($stateParams.id) {
				ClassSvc.read($stateParams.id, null, true).then(function(c) {
					$scope.currentClass = c;
				});
			}

            if (!$scope.currentClass.students) {
                $scope.currentClass.students = [];
            }

			$scope.back = function() {
				if (ClassSvc.viewing) {
					$state.go('admin.programs.viewclass', { id: $scope.currentClass._id});
				} else if (ClassSvc.creating) {
					$state.go('admin.programs.createclass');
				} else {
					$state.go('admin.programs.editclass', { id: $scope.currentClass._id});
				}
			}

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

            $scope.addSelected = function() {
                _($scope.gridOptions.selectedItems).forEach(function(student) {
                    if (!student) {
                        return;
                    }

                    $log.log(' |_ Adding student: ' + student.firstName + ' ' + student.lastName + ' ' + student._id + ' to class ' + $scope.currentClass.name);

                    $scope.currentClass.students.push(student._id);

                });

                // empty selection
                $scope.gridOptions.selectedItems.length = 0;
                $scope.back();
            
            };

            $scope.sortInfo = {fields: ['id'], directions: ['asc']};

            $scope.$watch('sortInfo', function(newVal, oldVal){
                if (!$scope.allData) return;
                if (newVal.fields[0] === oldVal.fields[0] && newVal.directions[0] === oldVal.directions[0]) return;

                sortData(newVal.fields[0], newVal.directions[0]);
                $scope.pagingOptions.currentPage = 1;
                $scope.setPagingData($scope.allData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
            }, true);

            function sortData(field, direction) {
                if(!$scope.allData) return;

                $scope.allData.sort(function(a, b) {
                    if(direction === 'asc') {
                        return a[field] > b[field] ? 1 : -1;
                    } else {
                        return a[field] > b[field] ? -1 : 1;
                    }
                });
            }

            $scope.setPagingData = function(data, page, pageSize){
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.myData = pagedData;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.getPagedDataAsync = function (pageSize, page, useCachedData) {
                setTimeout(function () {
                    if (useCachedData) {
                        $scope.setPagingData($scope.allData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
                        return;
                    }

                    var data = [];

                    StudentSvc.list().then(function(allStudents) {
						var students = allStudents;
                        _(students).forEach(function(student){
                            if (!_.find($scope.currentClass.students, function(id){ return id === student._id;})) {
                                data.push(student);
                            }
                        });

                        $scope.allData = data;
                        $scope.setPagingData(data,page,pageSize);
					});
                }, 100);
            };

            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

            $scope.$watch('pagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, true);
                }
            }, true);

            $scope.$watch('filterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                }
            }, true);

            $scope.gridOptions = {
                data: 'myData',
                rowHeight: 40,
                enablePaging: true,
                showFooter: true,
                sortInfo: $scope.sortInfo,
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                columnDefs: [
                    { cellTemplate: '/partials/students/list/studentAvatar', sortable: false, width: 70, height: 70, cellClass: 'grid-student-list-icon-cell' },
                    { field: 'firstName', displayName: 'First Name' },
                    { field: 'lastName', displayName: 'Last Name' },
                    { field: 'age', displayName: 'Age' }
                ]
            };

            $scope.addDisabled = function() {
                return $scope.gridOptions.selectedItems.length === 0;
            };

	}]);
});	