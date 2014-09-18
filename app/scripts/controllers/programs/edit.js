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
				ProgramSvc.read($stateParams.id, null, true).then(function(p) {
					$scope.currentProgram = c;
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
				$state.go('admin.programs.createclass');
			};

			$scope.goToEditClass = function(clss) {
				ClassSvc.init(clss);
				ClassSvc.startEditing();
				$state.go('admin.programs.editclass', { id: clss._id} );
			};

			$scope.removeClass = function(classToRemove) { 
				var c = confirm('Are you sure you want to delete ' + classToRemove.name + '?');

				if (c) {
					$scope.currentProgram.classes = _.without($scope.currentProgram.classes, classToRemove);
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
					async.each($scope.currentProgram.classes,
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

							ProgramSvc.save(beforeSave).then(function(added) {
								console.log('Changes to program' + added.name + ' successful.');
								ProgramSvc.reset();
								$state.go('admin.programs.home');
							});
							
						}
					);
				})(classIDs, rankIDs);
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