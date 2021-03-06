define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ProgramsCtrl', ['$scope', '$state', 'ProgramSvc', 'ClassSvc', 'RankSvc', 'AttendanceSvc', 'AchievementSvc', 
		function($scope, $state, ProgramSvc, ClassSvc, RankSvc, AttendanceSvc, AchievementSvc) {

/************ GridOptions *********************************/
			$scope.filterOptions = {
				filterText: '',
				useExternalFilter: true
			};

			$scope.totalServerItems = 0;
			
			$scope.pagingOptions = {
				pageSizes: [10, 25, 50],
				pageSize: 10,
				currentPage: 1
			};

			$scope.setPagingData = function(data, page, pageSize) {
				var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
				$scope.myData = pagedData;
				$scope.totalServerItems = data.length;
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			};

			$scope.getPagedDataAsync = function(pageSize, page, searchText) {
				setTimeout(function () {
					var data = [];

					ProgramSvc.list().then(function(programs) {
						async.parallel([
							function(callback, err) {
								//Get class objects and put into programs
								ClassSvc.list().then(function(classes) {
									var i;
									for(i=0; i<programs.length; i++) {
										programs[i].classes = _.where(classes, {'program': programs[i]._id});
									}
									callback();
								});
							},
							function(callback, err) {
								//Get rank objects and put into programs
								RankSvc.list().then(function(ranks) {
									var i;
									for(i=0; i<programs.length; i++) {
										programs[i].ranks = _.where(ranks, {'program': programs[i]._id});
										programs[i].ranks = _.remove(programs[i].ranks, function(r){ return !r.isIntermediaryRank;});
									}
									callback();
								});
							}],
							function(err) {
								_.each(programs, function(p) {
									data.push({
										'classObjs': p.classes,
										'rankObjs': p.ranks,
										'name': p.name,
										'classNames': _.map(p.classes, function(c){return c.name;}),
										'rankNames': _.map(p.ranks, function(r){return r.name;}),
										'_id': p._id
									});
								});
								$scope.setPagingData(data, page, pageSize);
							}
						);						
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
                afterSelectionChange: function (rowItem, event) {
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
                sortInfo: { fields: ['name'], directions: ['asc'] },
                columnDefs: [
                    { field: 'name', displayName: 'Program Name' },
                    { field: 'classNames', displayName: 'Classes', cellFilter: 'stringArray' },
                    { field: 'rankNames', displayName: 'Ranks', cellFilter: 'stringArray'},
                    { cellTemplate: '/partials/programs/list/optionsButton', sortable: false, displayName: 'Actions'},
                ]
            };
/*************** End GridOptions******************************/
			$scope.removeSelected = function() {
				$scope.showRemoveConfirm = true;
			};

			$scope.confirmRemove = function(remove) {
				if(remove) {
					_($scope.gridOptions.selectedItems).forEach(function(program) {
						$scope.removeProgram(program);
					});
					$scope.gridOptions.selectedItems.length = 0;
					$scope.showRemoveConfirm = false;
				} else {
					$scope.showRemoveConfirm = false;
				}
			};

			$scope.showRemoveConfirm = false;

			$scope.removeProgram = function(program) { 

				function removeClassesFromProgram(callback, err) {
					//Remove program's classes
					async.each(program.classObjs,
						function(classToRemove, callback) {
							ClassSvc.read(classToRemove._id, null, true).then(function(c) {
								// Remove associated attendance / achievements from model
								async.parallel([
									function(callback, err) {
										AttendanceSvc.list().then(function(attendances) {
											_(attendances).forEach(function(attendance) {
												if (attendance.classAttended === classToRemove._id) {
													AttendanceSvc.read(attendance._id, null, true).then(function() {
														AttendanceSvc.remove().then(function() {
															callback();
														});
													});
												}
											});
										});
									},
									function(callback, err) {
										AchievementSvc.list().then(function(achievements) {
											_(achievements).forEach(function(achievement) {
												if (achievement.class === classToRemove._id) {
													AchievementSvc.read(achievement._id, null, true).then(function() {
														AchievementSvc.remove().then(function() {
															callback();
														});
													});
												}
											});
										});
									},
									function(err) {
										ClassSvc.remove().then(function() {
											ClassSvc.reset();
											callback();
										});
								}]);
								
							});
						},
						function(err) {
							callback();
						}
					);
				}

				function removeRanksFromProgram(callback, err) {
					//Remove program's ranks
					async.each(program.rankObjs,
						function(rankToRemove, callback) {
							RankSvc.read(rankToRemove._id, null, true).then(function(r) {
								RankSvc.remove().then(function() {
									RankSvc.reset();
									callback();
								});
							});
						},
						function(err) {
							callback();
						}
					);
				}

				function removeProgramData(program) {

					async.parallel([
						removeClassesFromProgram,
						removeRanksFromProgram, 
						function(err) {
							//Remove program
							ProgramSvc.read(program._id, null, true).then(function(p) {
								ProgramSvc.remove().then(function() {
									//$scope.programs = _.without($scope.programs, program);
									$scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
									ProgramSvc.reset();
								});
							});
					}]);
				}
				removeProgramData(program);
			};

            $scope.removeDisabled = function() {
                return $scope.gridOptions.selectedItems.length == 0;
            };

			$scope.goToCreateProgram = function() {
				ProgramSvc.reset();
				ProgramSvc.startCreating();
				$state.go('admin.programs.create');
			};

			$scope.goToEditProgram = function(row) {
				ProgramSvc.startEditing();
				ProgramSvc.init(row.entity);
				$state.go('admin.programs.edit', { id: row.entity._id });
			};

			$scope.goToViewProgram = function(row) {
				ProgramSvc.startViewing();
				ProgramSvc.init(row.entity);
				$state.go('admin.programs.view', { id: row.entity._id });
			};

	}]);
});	