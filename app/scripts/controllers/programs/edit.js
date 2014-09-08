define(['../module'], function(controllers){
	'use strict';
	controllers.controller('EditProgramCtrl', ['$scope', '$state', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc', 
		function($scope, $state, Restangular, ProgramSvc, ClassSvc, RankSvc) {
			$scope.currentProgram = {};
			$scope.newClass = {};
			$scope.removedRanks = [];
			$scope.removedClasses = [];

			if (ProgramSvc.current) {
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

				//Add or update the program's ranks and classes
				(function(classIDs, rankIDs) {
					async.parallel([
						function(callback, err) {
							async.each($scope.removedClasses,
								function(classItem, callback) {
									ClassSvc.init(classItem);
									ClassSvc.remove().then(function(removed) {
										if (removed){
											console.log('Class ' + removed.name + ' successfully deleted');
										}
										ClassSvc.reset();
										callback();
									});
								},
								function(err) {
									callback();
								});
						},
						function(callback, err) {
							async.each($scope.removedRanks,
								function(rankItem, callback) {
									RankSvc.init(rankItem);
									RankSvc.remove().then(function(removed) {
										if (removed){
											console.log('Rank ' + removed.name + ' successfully deleted');
										}
										RankSvc.reset();
										callback();
									});
								},
								function(err) {
									callback();
								});
						},
						function(callback, err) {
							async.each($scope.currentProgram.classes,
								function(classItem, callback) {
									ClassSvc.init(classItem);
									ClassSvc.save().then(function(added) {
										classIDs.push(added._id);
										ClassSvc.reset();
										callback();
									});
								},
								function(err) {
									callback();
							});
						},
						function(callback, err) {
							async.each($scope.currentProgram.ranks,
								function(rankItem, callback) {
									RankSvc.init(rankItem);
									RankSvc.save().then(function(added) {
										rankIDs.push(added._id);
										RankSvc.reset();
										callback();
									});
								},
								function(err) {
									callback();
							});
						}],
						function(err) {

							function beforeSave(program) {
								program.classes = classIDs;
								program.ranks = rankIDs;
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
	}]);
});	