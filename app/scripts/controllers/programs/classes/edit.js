define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('EditClassCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$log', 'Restangular', 'StudentSvc', 'ClassSvc', 'ProgramSvc',
		function($rootScope, $scope, $state, $stateParams, $log, Restangular, StudentSvc, ClassSvc, ProgramSvc) {
			$scope.currentClass = {};
			var currentProgram = null,
				orig = null;

			if (ClassSvc.current && ClassSvc.editing) {
				$scope.currentClass = ClassSvc.current;
				currentProgram = ProgramSvc.current;
				currentProgram.populated = true;
				if (!ClassSvc.orig) {
					ClassSvc.orig = {
						name: ClassSvc.current.name,
						students: ClassSvc.current.students
					};
				}
				orig = ClassSvc.orig;
			} else if ($stateParams.id) {
				ClassSvc.read($stateParams.id, null, true).then(function(c) {
					$scope.currentClass = c;
					ClassSvc.orig = {
						name: c.name,
						students: c.students
					};
					orig = ClassSvc.orig;
					ProgramSvc.read($scope.currentClass.program, null, true).then(function(p) {
						var pClasses = [];
						currentProgram = p;
						async.each(p.classes,
							function(cItem, callback) {
								ClassSvc.read(cItem, null, false).then(function(pc) {
									pClasses.push(pc);
									callback();
								});
							},
							function(err) {
								currentProgram.classObjs = pClasses;
								currentProgram.populated = true;
							});
					});
					ClassSvc.editing = true;
				});
			}

			if (!$scope.currentClass.students) {
				$scope.currentClass.students = [];
			}

			function goToPrevState() {
                $state.go($rootScope.previousState);
				// if (ProgramSvc.editing) {
				// 	$state.go('admin.programs.edit', { id: currentProgram._id});
				// } else if (ProgramSvc.creating) {
				// 	$state.go('admin.programs.create');
				// } else {
				// 	$state.go('admin.programs.home');
				// }
			}

			$scope.saveClass = function() {
				//Find the original class in the program and replace it with the edited class
				var i = _.findIndex(currentProgram.classObjs, function(c) {
					return c.name === ClassSvc.orig.name;
				});
				if (i >= 0) {
					currentProgram.classObjs[i] = $scope.currentClass;
				} else {
					currentProgram.classObjs.push($scope.currentClass);
				}

				ClassSvc.reset();
				ClassSvc.orig = null;

				goToPrevState();
				
			};

			$scope.cancelEdit = function() {

				ClassSvc.reset();
				ClassSvc.orig = null;

				goToPrevState();
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

            $scope.getPagedData = function (pageSize, page) {
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

           	$scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

            $scope.$watch('pagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);

            $scope.$watch('filterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
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

            $scope.doStuff = function() {
            	var c = $scope.currentClass;
            };

            $scope.confirmRemove = function(remove) {
                if(remove) {
                    $log.log('Removing selected students...');

                    _($scope.gridOptions.selectedItems).forEach(function(student) {
                    	if (!student) {
                    		return;
                    	}

                        $log.log(' |_ Removing student: ' + student.firstName + ' ' + student.lastName + ' ' + student._id);
                        // removeStudentData(student);

                        $scope.currentClass.students = $scope.currentClass.students.filter(function(filterStudent) {
                        	return filterStudent !== student._id;
                        });
                    });

                    //completeRemove();
                    $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

                    // empty selection
                    $scope.gridOptions.selectedItems.length = 0;

                    $scope.showRemoveConfirm = false;
                } else {
                    $scope.showRemoveConfirm = false;
                }
            };

            $scope.showRemoveConfirm = false;

            function completeRemove() {
                //Remove Students
                function beforeSave(_class)  {
                	_class.students = _class.students.map(function(student) {
                		if (student) {
                			return student._id;
                		}
                	}).filter(function(filterStudent) {
                		return filterStudent;
                	});

                	return _class;
                }

                // ClassSvc.save(beforeSave).then(function() {
                //     $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
                // });
            }

/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canSaveClass = function() {
				return !$scope.isEmpty($scope.currentClass.name) && !$scope.isDupName();
			};

			$scope.isDupName = function() {
				var names = [];
				if (currentProgram && currentProgram.populated && orig) {
					names = _.map(currentProgram.classObjs, function(c){return c.name;});
					names = _.without(names, orig.name);
				}

				return _.contains(names, $scope.currentClass.name);
			};
	}]);
});	