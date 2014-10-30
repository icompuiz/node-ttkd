define(['../module'], function(controllers){
	'use strict';
	controllers.controller('EditProgramCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'WizardService', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc', 
		function($rootScope, $scope, $state, $stateParams, WizardService, Restangular, ProgramSvc, ClassSvc, RankSvc) {
			$scope.currentProgram = {};
			$scope.removedRanks = [];
			$scope.removedClasses = [];

			$scope.programNames = [];

			$scope.getPrograms = function(){
				ProgramSvc.list().then(function(progs) {
					$scope.programNames = _.map(progs, function(p){return p.name;});
					$scope.programNames = _.without($scope.programNames, $scope.currentProgram.name);
				});
			};
			$scope.getPrograms();
			setTab();

			function setTab() {
				if ($rootScope.previousState.indexOf('rank') > -1) {// Show ranks tab if the previous state contains 'rank'
					$scope.showRanks = true;
				} else {
					$scope.showClasses = true;
				}
			}

			function attachSubranksToRank(rankObj) {
				if (!rankObj.intermediaryRanks) {
					return;
				}

				var subrankObjs = [];
				async.each(rankObj.intermediaryRanks,
					function(subrankId, callback) {
						RankSvc.read(subrankId, null, false).then(function(subrank) {
							subrankObjs.push(subrank);
							callback();
						});
					},
					function(err) {
						rankObj.subrankObjs = subrankObjs;
				});
			}

			function attachClassAndRankObjs(){
				//Attach class objects to current program
				ClassSvc.list().then(function(classes) {
					$scope.currentProgram.classObjs = _.where(classes, {program: $scope.currentProgram._id});
				});
				
				//Attach rank and subrank objects to current program
				RankSvc.list().then(function(ranks) {
					$scope.currentProgram.rankObjs = _.where(ranks, {program: $scope.currentProgram._id, isIntermediaryRank: undefined});
					var rankObjs = [];
					async.each($scope.currentProgram.rankObjs, 
						function(rank, callback) {
							var subrankObjs = [];
							async.each(rank.intermediaryRanks,
								function(subrankId, callback) {
									RankSvc.read(subrankId, null, false).then(function(subrank) {
										// Add sub-rank list item identifier to subrank object
										subrank.divId = 'r' + subrank._id;
										subrankObjs.push(subrank);
										callback();
									});
								},
								function(err) {
									rank.subrankObjs = subrankObjs;
									rankObjs.push(rank);
									callback();
							});
						},
						function(err) {
							$scope.currentProgram.rankObjs = rankObjs;
					});		
				});				
			}

			if (!WizardService.get($scope.currentProgram._id)) {
				WizardService.create($scope.currentProgram._id, true);
			}

			// Load current program if ProgramSvc has one
			if (ProgramSvc.current && ProgramSvc.editing) {
				$scope.currentProgram = ProgramSvc.current;

				if (ProgramSvc.removedClasses) {
					$scope.removedClasses = ProgramSvc.removedClasses;
				}

				if (ProgramSvc.removedRanks) {
					$scope.removedRanks = ProgramSvc.removedRanks;
				}

				
				_.each($scope.currentProgram.rankObjs, function(rank) {
					if (!rank.subrankObjs || rank.subrankObjs.length === 0) {
						attachSubranksToRank(rank);
					}
				});
			} else if ($stateParams.id) {
				ProgramSvc.read($stateParams.id, null, true).then(function(p) {
					ProgramSvc.editing = true;
					$scope.getPrograms();
					$scope.currentProgram = p;
					attachClassAndRankObjs();
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

			$scope.goToViewClass = function(row) {
				ClassSvc.init(row.entity);
				ClassSvc.startViewing();
				$state.go('admin.programs.viewclass', {id: row.entity._id} );
			};

			$scope.goToEditClass = function(row) {
				ClassSvc.init(row.entity);
				ClassSvc.startEditing();
				$state.go('admin.programs.editclass', { id: row.entity._id} );
			};

			$scope.goToCreateRank = function() {
				RankSvc.reset();
				RankSvc.startCreating();
				$state.go('admin.programs.createrank', {id: $scope.currentProgram._id});
			};

			$scope.goToViewRank = function(row) {
				RankSvc.init(row.entity);
				RankSvc.startViewing();
				$state.go('admin.programs.viewrank', {id: row.entity._id} );
			};

			$scope.goToEditRank = function(row) {
				RankSvc.init(row.entity);
				RankSvc.startEditing();
				$state.go('admin.programs.editrank', { id: row.entity._id} );
			};

			$scope.saveProgram = function() {
				var classIDs = [],
					rankIDs = [];

				//Add or update classes
				function updateClasses(callback, err) {
					async.each($scope.currentProgram.classObjs,
						function(classItem, callback) {

							function beforeSave(c) {
								c.name = classItem.name;
								c.meetingTimes = classItem.meetingTimes;
								c.students = classItem.students;
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
				function updateClassRemovals(callback, err) {
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

				//Add or update ranks
				function updateRanks(callback, err) {

					async.each($scope.currentProgram.rankObjs,
						function(rankItem, callback) {
							function beforeSave(c) {
								c.name = rankItem.name;
								c.rankOrder = rankItem.rankOrder;
								c.intermediaryRanks = subrankIds;
								c.program = $scope.currentProgram._id;
								c.color = rankItem.color;
							}

							var subrankIds = [];

							async.each(rankItem.subrankObjs,
								function(subrank, callback) {
									RankSvc.init(subrank);
									RankSvc.save().then(function(saved) {
										subrankIds.push(saved._id);
										callback();
									});
								},
								function(err) {
									rankItem.intermediaryRanks = subrankIds;
									RankSvc.init(rankItem);
									RankSvc.save(beforeSave).then(function(saved) {
										rankIDs.push(saved._id);
										callback();
									});
								});												
						},
						function(err) {
							callback();
						});
				}

				//Send deletions to the model for ranks that were removed from the program
				function updateRankRemovals(callback, err) {
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

				(function(classIDs, rankIDs) {
					async.parallel([
						updateClasses,
						updateRanks,
						updateClassRemovals,
						updateRankRemovals],
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
							});
							
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
						$scope.classGridOptions.selectedItems.length = 0;
					});
					$scope.showRemoveClassesConfirm = false;
				} else {
					$scope.showRemoveClassesConfirm = false;
				}
			};

			$scope.showRemoveClassesConfirm = false;

            $scope.removeRankDisabled = function() {
                return $scope.rankGridOptions.selectedItems.length == 0;
            };

			$scope.removeSelectedRanks = function() {
				$scope.showRemoveRanksConfirm = true;
			};

			$scope.confirmRemoveRanks = function(remove) {
				function shiftRankOrders() {
					var sorted = _.sortBy($scope.currentProgram.rankObjs, 'rankOrder');

					var i = 1;
					_(sorted).forEach(function(r) {
						r.rankOrder = i;
						i++;
					});

					$scope.currentProgram.rankObjs = sorted;
				}

				if(remove) {
					_($scope.rankGridOptions.selectedItems).forEach(function(r) {
						$scope.currentProgram.rankObjs = _.without($scope.currentProgram.rankObjs, r);
						$scope.removedRanks.push(r);
						$scope.rankGridOptions.selectedItems.length = 0;
					});
					shiftRankOrders();
					$scope.showRemoveRanksConfirm = false;
				} else {
					$scope.showRemoveRanksConfirm = false;
				}
			};
			$scope.showRemoveRanksConfirm = false;

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

            $scope.classGridOptions = {
            	data: 'myClassData',
                rowHeight: 40,
                enablePaging: true,
               // showFooter: true,
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
                    { cellTemplate: '/partials/programs/classes/list/editOptionsButton', sortable: false, displayName: 'Actions'},
                ]
            };

/********************** Ranks Grid Options *****************************/

			$scope.rankFilterOptions = {
				filterText: '',
				useExternalFilter: true
			};

			$scope.rankTotalServerItems = 0;
			
			$scope.rankPagingOptions = {
				pageSizes: [10, 25, 50],
				pageSize: 10,
				currentPage: 1
			};

			$scope.setRankPagingData = function(data, page, pageSize) {
				var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
				$scope.myRankData = pagedData;
				$scope.rankTotalServerItems = data.length;
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			};

			$scope.setRankGridData = function(pageSize, page, searchText) {
				var data = [];
				_.each($scope.currentProgram.rankObjs, function(c) {
					data.push(c);
				});
				$scope.setRankPagingData(data, page, pageSize);
			};

            $scope.$watch('currentProgram.rankObjs', function () {
			    $scope.setRankGridData($scope.rankPagingOptions.pageSize, $scope.rankPagingOptions.currentPage, $scope.rankFilterOptions.filterText);
            }, true);

            $scope.$watch('rankPagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.setRankGridData($scope.rankPagingOptions.pageSize, $scope.rankPagingOptions.currentPage, $scope.rankFilterOptions.filterText);
                }
            }, true);

            $scope.$watch('rankFilterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.setRankGridData($scope.rankPagingOptions.pageSize, $scope.rankPagingOptions.currentPage, $scope.rankFilterOptions.filterText);
                }
            }, true);

            $scope.rankGridOptions = {
            	data: 'myRankData',
                rowHeight: 40,
                enablePaging: true,
                //showFooter: true,
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
                    if($scope.rankGridOptions.selectedItems.length === 0) {
                        $scope.showRemoveConfirm = false;
                    }
                    return true;
                },
                totalServerItems: 'rankTotalServerItems',
                pagingOptions: $scope.rankPagingOptions,
                filterOptions: $scope.rankFilterOptions,
                selectedItems: [],
                sortInfo: { fields: ['name'], directions: ['asc'] },
                columnDefs: [
                    { field: 'name', displayName: 'Rank Name' },
                    { field: 'rankOrder', displayName: 'Order' },
                    { cellTemplate: '/partials/programs/ranks/list/editOptionsButton', sortable: false, displayName: 'Actions'},
                ]
            };

/********************** Form Validation **********************************/
			$scope.isEmpty = function() {
				return (!$scope.currentProgram.name || 0 === $scope.currentProgram.name.length);				
			};

			$scope.canSaveProgram = function() {
				return !$scope.isEmpty() && !$scope.isDupName();
			};

			$scope.isDupName = function() {
				return _.contains($scope.programNames, $scope.currentProgram.name);
			};
	}]);
});	