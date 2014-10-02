define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('AddStudentCtrl', ['$scope', '$state', '$stateParams', '$log', 'Restangular', 'ClassSvc',
		function($scope, $state, $stateParams, $log, Restangular, ClassSvc) {
			$scope.currentClass = {};

			if (ClassSvc.current && ClassSvc.editing) {
				$scope.currentClass = ClassSvc.current;
			} else if ($stateParams.id) {
				ClassSvc.read($stateParams.id, null, true).then(function(c) {
					$scope.currentClass = c;
				});
			}

			$scope.back = function() {
				if (ClassSvc.editing) {
					$state.go('admin.programs.editclass', { id: $scope.currentClass._id});
				} else if (ClassSvc.creating) {
					$state.go('admin.programs.createclass');
				} else {
					$state.go('admin.programs.viewclass', { id: $scope.currentClass._id});
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

                    ClassSvc.read($stateParams.id, {populate: 'students'}, false).then(function(_class) {
						var students = _class.students;
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
                beforeSelectionChange: function(){},
                afterSelectionChange: function(){},
                // beforeSelectionChange: function (rowItem, event) {
                //     // check if one of the options buttons was clicked
                //     if(event.target.tagName === 'BUTTON') {
                //         return false;
                //     } else {
                //         return true;
                //     }
                // },
                // afterSelectionChange: function () {
                //     if($scope.gridOptions.selectedItems.length === 0) {
                //         $scope.showRemoveConfirm = false;
                //     }
                //     return true;
                // },
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                sortInfo: { fields: ['lastName', 'firstname'], directions: ['asc', 'asc'] },
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