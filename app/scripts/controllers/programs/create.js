define(['../module'], function(controllers){
	'use strict';
	controllers.controller('CreateProgramCtrl', ['$scope', '$state', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc', 
		function($scope, $state, Restangular, ProgramSvc, ClassSvc, RankSvc) {
			$scope.newProgram = {};
			$scope.newClass = {};
			$scope.newRank = {};


			$scope.programNames = [];

			$scope.getPrograms = function(){
				ProgramSvc.list().then(function(progs) {
					$scope.programNames = _.map(progs, function(p){return p.name;});
				});
			};
			$scope.getPrograms();

			if (ProgramSvc.current && ProgramSvc.creating) {
				$scope.newProgram = ProgramSvc.current;
			} else {
				$scope.newProgram = ProgramSvc.init({
					classes: [],
					ranks: []
				});
			}

			$scope.cancelCreate = function() {
				ProgramSvc.reset();
				ProgramSvc.removedRanks = undefined;
				ProgramSvc.removedClasses = undefined;
				$state.go('admin.programs.home');
			};

			$scope.removeClass = function(classToRemove) { 
				var c = confirm('Are you sure you want to delete ' + classToRemove.name + '?');

				if (c) {
					$scope.newProgram.classes = _.without($scope.newProgram.classObjs, classToRemove);
				}
			};

			$scope.removeClass = function(rankToRemove) { 
				var c = confirm('Are you sure you want to delete ' + rankToRemove.name + '?');

				if (c) {
					$scope.newProgram.ranks = _.without($scope.newProgram.ranks, rankToRemove);
				}
			};

			$scope.addClassToProgram = function(program) {
				program.classObjs.push($scope.newClass);
				$scope.newClass = {};
			};

			$scope.addRankToProgram = function(program) {
				program.ranks.push($scope.newRank);
				$scope.newRank = {};
			};

			$scope.goToCreateClass = function() {
				ClassSvc.reset();
				ClassSvc.startCreating();
				$state.go('admin.programs.createclass');
			};

			$scope.goToEditClass = function(row) {
				ClassSvc.init(row.entity);
				ClassSvc.startEditing();
				$state.go('admin.programs.editclass');
			};

			$scope.createProgram = function() {
				var programToAdd = {
					name: $scope.newProgram.name
				};
				var programAdded = null;
				var classIDs = [],
					rankIDs = [];

				//POST new program
				ProgramSvc.init(programToAdd);
				ProgramSvc.create(true).then(function(added) {
					programAdded = added;
					//Add classes to db
					(function(classIDs, rankIDs){
						async.parallel([
							addNewClasses,
							addNewRanks],
							function(err) {
								//Add class and rank references and update program
								ProgramSvc.read(programAdded._id, {}, true).get().then(function(p){
									var updates = {
										classes: classIDs,
										ranks: rankIDs
									};

									function beforeSave(c) {
										c.classes = classIDs;
										c.ranks = rankIDs;
									}

									ProgramSvc.save(beforeSave).then(function(saved) {		
										ProgramSvc.reset();
										$state.go('admin.programs.home');
									});
								});
						});
					})(classIDs, rankIDs);
				});

				function addNewClasses(callback, err) {
					//Add classes
					async.each($scope.newProgram.classObjs,
						function(classItem, callback) {
							var classToAdd = {
								name: classItem.name,
								program: programAdded._id
							};
							//POST each new class and add object ID to array
							ClassSvc.init(classToAdd);
							ClassSvc.create(true).then(function(classAdded, err){
								classIDs.push(classAdded._id);
								callback();
							});
						},
						function(err) {
							callback();
						}
					);
				}

				function addNewRanks(callback, err) {
					//Add ranks
					async.each($scope.newProgram.ranks,
						function(rankItem, callback) {
							var rankToAdd = {
								name: rankItem.name,
								rankOrder: rankItem.rankOrder,
								program: programAdded._id
							};
							//POST each new rank and add object ID to array
							RankSvc.init(rankToAdd);
							RankSvc.create().then(function(rankAdded, err){
								rankIDs.push(rankAdded._id);
								callback();
							});
						},
						function(err) {
							callback();
						}
					);
				}
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
						$scope.newProgram.classObjs = _.without($scope.newProgram.classObjs, c);
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
				_.each($scope.newProgram.classObjs, function(c) {
					data.push(c);
				});
				$scope.setClassPagingData(data, page, pageSize);
			};

            $scope.$watch('newProgram.classObjs', function () {
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
                    { cellTemplate: '/partials/programs/classes/list/editOptionsButton', sortable: false, displayName: 'Actions'},
                ]
            };


/********************** Form Validation **********************************/
			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canSaveProgram = function() {
				return !$scope.isEmpty($scope.newProgram.name) && !$scope.isDupName();
			};

			$scope.isDupName = function() {
				return _.contains($scope.programNames, $scope.newProgram.name);
			};

	}]);
});	