define(['../module'], function(controllers){
	'use strict';
	controllers.controller('EditProgramCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc', 
		function($scope, $state, $stateParams, Restangular, ProgramSvc, ClassSvc, RankSvc) {
			$scope.currentProgram = {};
			$scope.newClass = {};
			$scope.newRank = {};
			$scope.removedRanks = [];
			$scope.removedClasses = [];

			if (ProgramSvc.current && ProgramSvc.editing) {
				$scope.currentProgram = ProgramSvc.current;

				if (!ProgramSvc.removedClasses) {
					$scope.removedClasses = [];
				} else {
					$scope.removedClasses = ProgramSvc.removedClasses;
				}

				if (!ProgramSvc.removedRanks) {
					$scope.removedRanks = [];
				} else {
					$scope.removedRanks = ProgramSvc.removedRanks;
				}
			} else if ($stateParams.id) {
				var pClasses = [];
				ProgramSvc.read($stateParams.id, null, true).then(function(p) {
					ProgramSvc.editing = true;
					$scope.currentProgram = p;
					_.each($scope.currentProgram.classes, function(cId) {
						ClassSvc.read(cId, null, false).then(function(c) {
							pClasses.push(c);
						});
					});
					$scope.currentProgram.classObjs = pClasses;
				});
			}

			$scope.cancelEdit = function() {
				ProgramSvc.reset();
				ProgramSvc.removedRanks = undefined;
				ProgramSvc.removedClasses = undefined;
				$state.go('admin.programs.home');
			};

			$scope.goToCreateClass = function() {
				ClassSvc.reset();
				ClassSvc.startCreating();
				$state.go('admin.programs.createclass', {id: $scope.currentProgram._id});
			};

			$scope.goToEditClass = function(row) {
				ClassSvc.init(row.entity);
				ClassSvc.startEditing();
				$state.go('admin.programs.editclass', { id: row.entity._id} );
			};

			$scope.removeClass = function(classToRemove) { 
				var c = confirm('Are you sure you want to delete ' + classToRemove.name + '?');

				if (c) {
					$scope.currentProgram.classObjs = _.without($scope.currentProgram.classObjs, classToRemove);
					$scope.removedClasses.push(classToRemove);
				}
			};

			$scope.removeRank = function(rankToRemove) { 
				var c = confirm('Are you sure you want to delete ' + rankToRemove.name + '?');

				if (c) {
					$scope.currentProgram.ranks = _.without($scope.currentProgram.ranks, rankToRemove);
					$scope.removedRanks.push(rankToRemove);
				}
			};

			$scope.saveProgram = function() {
				var classIDs = [],
					rankIDs = [];

				//Add or update classes
				function addClassesToModel(callback, err) {
					async.each($scope.currentProgram.classObjs,
						function(classItem, callback) {

							function beforeSave(c) {
								c.name = classItem.name;
								c.meetingTimes = classItem.meetingTimes;
								c.studentList = classItem.studentList;
								c.program = $scope.currentProgram._id;
							}

							ClassSvc.init(classItem);
							ClassSvc.save(beforeSave).then(function(c) {
								classIDs.push(c._id);
								callback();
							});
												
						},
						function(err) {
							callback();
						});
				}

				//Send deletions to the model for classes that were removed from the program
				function removeClassesFromModel(callback, err) {
					async.each($scope.removedClasses,
						function(classItem, callback) {
							if (!classItem._id) {
								callback();
							} else {
								ClassSvc.read(classItem._id, null, true).then(function(cls) {
									ClassSvc.remove().then(function(removed) {
										classIDs = _.without(classIDs, cls._id);
										ClassSvc.reset();
										callback();
									});
								});
							}
						},
						function(err) {
							callback();
						});
				}

				//Send deletions to the model for ranks that were removed from the program
				function removeRanksFromModel(callback, err) {
					async.each($scope.removedRanks,
						function(rankItem, callback) {
							if (!rankItem._id) {
								callback();
							} else {
								RankSvc.read(rankItem._id, null, true).then(function(rnk) {
									RankSvc.remove().then(function(removed) {
										if (removed){
											console.log('Rank ' + removed.name + ' successfully deleted');
										}
										RankSvc.reset();
										callback();
									});
								});
							}
						},
						function(err) {
							callback();
						});
				}

				//Add or update ranks
				function addRanksToModel(callback, err) {
					async.each($scope.currentProgram.ranks,
						function(rankItem, callback) {
							//Temporary... rank service will eventually be 
							//	initialized and will save from its "Create" form
							RankSvc.init(rankItem);
							function beforeSave(r) {
								r.name = rankItem.name;
								r.rankOrder = rankItem.rankOrder;
								r.intermediaryRanks = rankItem.intermediaryRanks;
								r.program = $scope.currentProgram._id;
							}

							RankSvc.save(beforeSave).then(function(saved) {
								callback();
							});
						},
						function(err) {
							callback();
						});
				}

				(function(classIDs, rankIDs) {
					async.parallel([
						addClassesToModel,
						removeClassesFromModel,
						removeRanksFromModel],
						function(err) {

							function beforeSave(program) {
								program.classes = classIDs;
								program.ranks = rankIDs;
								program.name = $scope.currentProgram.name;
							}

							ProgramSvc.read($scope.currentProgram._id, null, true).then(function(p) {
								ProgramSvc.save(beforeSave).then(function(added) {
								console.log('Changes to program' + added.name + ' successful.');
								ProgramSvc.reset();
								$state.go('admin.programs.home');
							});
							})
							
							
						}
					);
				})(classIDs, rankIDs);
			};

            $scope.removeClassDisabled = function() {
                return $scope.classGridOptions.selectedItems.length == 0;
            };

			$scope.removeSelectedClasses = function() {
				$scope.showRemoveClassesConfirm = true;
			};

			$scope.confirmRemoveClasses = function(remove) {
				if(remove) {
					_($scope.classGridOptions.selectedItems).forEach(function(c) {
						$scope.currentProgram.classObjs = _.without($scope.currentProgram.classObjs, c);
						$scope.removedClasses.push(c);
					});
					$scope.showRemoveClassesConfirm = false;
				} else {
					$scope.showRemoveClassesConfirm = false;
				}
			};

			$scope.showRemoveClassesConfirm = false;

/********************** Classes Grid Options *****************************/
			$scope.classFilterOptions = {
				filterText: '',
				useExternalFilter: true
			};

			$scope.classTotalServerItems = 0;
			
			$scope.classPagingOptions = {
				pageSizes: [10, 25, 50],
				pageSize: 10,
				currentPage: 1
			};

			$scope.setClassPagingData = function(data, page, pageSize) {
				var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
				$scope.myClassData = pagedData;
				$scope.classTotalServerItems = data.length;
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			};

			$scope.setClassGridData = function(pageSize, page, searchText) {
				var data = [];
				_.each($scope.currentProgram.classObjs, function(c) {
					data.push(c);
				});
				$scope.setClassPagingData(data, page, pageSize);
			};

            $scope.$watch('currentProgram.classObjs', function () {
			    $scope.setClassGridData($scope.classPagingOptions.pageSize, $scope.classPagingOptions.currentPage, $scope.classFilterOptions.filterText);
            }, true);

            $scope.$watch('classPagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.setClassGridData($scope.classPagingOptions.pageSize, $scope.classPagingOptions.currentPage, $scope.classFilterOptions.filterText);
                }
            }, true);

            $scope.$watch('classFilterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.setClassGridData($scope.classPagingOptions.pageSize, $scope.classPagingOptions.currentPage, $scope.classFilterOptions.filterText);
                }
            }, true);

            $scope.classOptionsButton = '<button type="button" class="btn btn-default btn-sm viewBtn" ng-click="goToViewClass(row)" >View</button> <button type="button" class="btn btn-default btn-sm editBtn" ng-click="goToEditClass(row)" >Edit</button>';

            $scope.classGridOptions = {
            	data: 'myClassData',
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
                afterSelectionChange: function (rowItem, event) {
                    // check if one of the options buttons was clicked
                    if($scope.classGridOptions.selectedItems.length === 0) {
                        $scope.showRemoveConfirm = false;
                    }
                    return true;
                },
                totalServerItems: 'classTotalServerItems',
                pagingOptions: $scope.classPagingOptions,
                filterOptions: $scope.classFilterOptions,
                selectedItems: [],
                sortInfo: { fields: ['name'], directions: ['asc'] },
                columnDefs: [
                    { field: 'name', displayName: 'Class Name' },
                    { cellTemplate: $scope.classOptionsButton, sortable: false, displayName: 'Actions'},
                ]
            };

/********************** Form Validation **********************************/
			function isEmpty(str) {
				return (!str || 0 === str.length);				
			}

			$scope.canSaveProgram = function() {
				return !isEmpty($scope.currentProgram.name);
			};
	}]);
});	