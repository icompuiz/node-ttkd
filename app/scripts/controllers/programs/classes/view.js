define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('ViewClassCtrl', ['$rootScope', '$scope', '$state', '$stateParams','$log', 'Restangular', 'ProgramSvc', 'ClassSvc','StudentSvc',
		function($rootScope, $scope, $state, $stateParams,$log, Restangular, ProgramSvc, ClassSvc, StudentSvc) {
			$scope.currentClass = {};

			if (ClassSvc.current && ClassSvc.viewing) {
				$scope.currentClass = ClassSvc.current;
			} else if ($stateParams.id) {
				ClassSvc.read($stateParams.id, null, true).then(function(_class) {
					$scope.currentClass = _class;
				});
			}

	       $scope.goBack = function() {
                $state.go($rootScope.previousState);
                // if (ProgramSvc.editing) {
                //     $state.go('admin.programs.edit', { id: ProgramSvc.current._id });
                // } else if (ProgramSvc.creating) {
                //     $state.go('admin.programs.create');
                // } else {
                //     $state.go('admin.programs.home');
                // }
            };
			            
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
                var data = [];
                async.each($scope.currentClass.students,
                    function(id, callback) {
                        StudentSvc.read(id, null, false).then(function(s) {
                            data.push(s);
                            callback();
                        });
                    },
                    function(err) {
                        $scope.setPagingData(data,page,pageSize);
                });                 
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
                    { field: 'age', displayName: 'Age' },
                    { cellTemplate: '/partials/students/list/viewButton', sortable: false },
                ]
            };

            $scope.view = function(row){
                console.log('View student id: ' + row.entity._id);
                $state.go('admin.students.view', {id: row.entity._id});
            };

            // $scope.removeDisabled = function() {
            //     return $scope.gridOptions.selectedItems.length === 0;
            // };

            // $scope.remove = function() {
            //     $scope.showRemoveConfirm = true;
            // };

            // $scope.confirmRemove = function(remove) {
            //     if(remove) {
            //         $log.log('Removing selected students...');

            //         _($scope.gridOptions.selectedItems).forEach(function(student) {
            //         	if (!student) {
            //         		return;
            //         	}

            //             $log.log(' |_ Removing student: ' + student.firstName + ' ' + student.lastName + ' ' + student._id);
            //             // removeStudentData(student);

            //             $scope.currentClass.students = $scope.currentClass.students.filter(function(filterStudent) {
            //             	return filterStudent._id !== student._id
            //             });
            //         });

            //         completeRemove();

            //         // empty selection
            //         $scope.gridOptions.selectedItems.length = 0;

            //         $scope.showRemoveConfirm = false;
            //     } else {
            //         $scope.showRemoveConfirm = false;
            //     }
            // };

            // $scope.showRemoveConfirm = false;

            // function completeRemove() {
            //     //Remove Students
            //     function beforeSave(_class)  {
            //     	_class.students = _class.students.map(function(student) {
            //     		if (student) {
            //     			return student._id;
            //     		}
            //     	}).filter(function(filterStudent) {
            //     		return filterStudent;
            //     	});

            //     	return _class;
            //     }

            //     ClassSvc.save(beforeSave).then(function() {
            //         $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            //     });
            // }

	}]);
});	