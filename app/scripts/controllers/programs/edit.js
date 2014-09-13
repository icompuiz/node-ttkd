define(['../module'], function(controllers){
	'use strict';
	controllers.controller('EditProgramCtrl', ['$scope', '$state', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc', 
		function($scope, $state, Restangular, ProgramSvc, ClassSvc, RankSvc) {
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
			}

			$scope.cancelEdit = function() {
				ProgramSvc.reset();
				ProgramSvc.removedRanks = undefined;
				ProgramSvc.removedClasses = undefined;
				$state.go('admin.programs.home');
			};

			$scope.addClass = function() {
				var classToAdd = {
					name: $scope.newClass.name,
					meetingTimes: $scope.newClass.meetingTimes,
					studentList: $scope.newClass.studentList,
					program: $scope.currentProgram._id
				};
				$scope.currentProgram.classes.push(classToAdd);
				$scope.newClass = {};
			};

			$scope.addRank = function() {
				var rankToAdd = {
					name: $scope.newRank.name,
					rankOrder: $scope.newRank.rankOrder,
					intermediaryRanks: $scope.newRank.intermediaryRanks,
					program: $scope.currentProgram._id
				};
				$scope.currentProgram.ranks.push(rankToAdd);
				$scope.newRank = {};
			};

			$scope.removeClass = function(classToRemove) { 
				$scope.currentProgram.classes = _.without($scope.currentProgram.classes, classToRemove);
				$scope.removedClasses.push(classToRemove);
			};

			$scope.removeRank = function(rankToRemove) { 
				$scope.currentProgram.ranks = _.without($scope.currentProgram.ranks, rankToRemove);
				$scope.removedRanks.push(rankToRemove);
			};

			$scope.saveProgram = function() {
				var classIDs = [],
					rankIDs = [];

				//Send deletions to the model for classes that were removed from the program
				function removeClassesFromModel(callback, err) {
					async.each($scope.removedClasses,
						function(classItem, callback) {
							if (!classItem._id) {
								callback();
							} else {
								ClassSvc.read(classItem._id, null, true).then(function(cls) {
									ClassSvc.remove().then(function(removed) {
										if (removed){
											console.log('Class ' + removed.name + ' successfully deleted');
										}
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

				//Add or update classes
				function addClassesToModel(callback, err) {
					async.each($scope.currentProgram.classes,
						function(classItem, callback) {
							//Temporary... class service will eventually be 
							//	initialized and will save from its "Create" form
							ClassSvc.init(classItem);
							function beforeSave(c) {
								c.name = classItem.name;
								c.meetingTimes = classItem.meetingTimes;
								c.studentList = classItem.studentList;
								c.program = $scope.currentProgram._id;
							}

							if (classItem._id) { //Update exiting class
								ClassSvc.read(classItem._id, null, true).then(function(cls) {
									ClassSvc.save().then(function(added) {
										classIDs.push(added._id);
										ClassSvc.reset();
										callback();
									});
								});
							} else { //Add new class
								ClassSvc.save(beforeSave).then(function(added) {
									classIDs.push(added._id);
									ClassSvc.reset();
									callback();
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

							if (rankItem._id) { //Update exiting rank
								RankSvc.read(rankItem._id, null, true).then(function(rnk) {
									RankSvc.save().then(function(added) {
										rankIDs.push(added._id);
										RankSvc.reset();
										callback();
									});
								});
							} else { //Add new rank
								RankSvc.save(beforeSave).then(function(added) {
									classIDs.push(added._id);
									RankSvc.reset();
									callback();
								});
							}
						},
						function(err) {
							callback();
						});
				}

				//Send deletions to the model
				(function(classIDs, rankIDs) {
					async.parallel([
						removeClassesFromModel,
						removeRanksFromModel,
						addClassesToModel,
						addRanksToModel],
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

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.isClassValid = function() {
				var classNames = _.map($scope.currentProgram.classes, function(c) { return c.name; });
				return !$scope.isEmpty($scope.newClass.name) && !_.contains(classNames, $scope.newClass.name);
			};

			$scope.isRankValid = function() {
				var rankNames = _.map($scope.currentProgram.ranks, function(r) { return r.name; });
				var rankOrders = _.map($scope.currentProgram.ranks, function(r) { return r.rankOrder; });
				var valid = true;

				//Validate rank name
				if ($scope.isEmpty($scope.newRank.name) || _.contains(rankNames, $scope.newRank.name)) {
					valid = false;
				}

				//validate rank Order
				if ($scope.isEmpty($scope.newRank.rankOrder) || _.contains(rankOrders, parseInt($scope.newRank.rankOrder))) {
					valid = false;
				}

				return valid;
			};
	}]);
});	