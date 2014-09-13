define(['../module'], function(controllers){
	'use strict';
	controllers.controller('CreateProgramCtrl', ['$scope', '$state', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc', 
		function($scope, $state, Restangular, ProgramSvc, ClassSvc, RankSvc) {
			$scope.newProgram = {};
			$scope.newClass = {};
			$scope.newRank = {};

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

			$scope.removeClassFromProgram = function(classToRemove, program) {
				program.classes = _.without(program.classes, classToRemove);
			};

			$scope.removeRankFromProgram = function(rankToRemove, program) {
				program.ranks = _.without(program.ranks, rankToRemove);
			};

			$scope.addClassToProgram = function(program) {
				program.classes.push($scope.newClass);
				$scope.newClass = {};
			};

			$scope.addRankToProgram = function(program) {
				program.ranks.push($scope.newRank);
				$scope.newRank = {};
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
									ProgramSvc.update(updates).then(function(updated) {									
										$scope.newProgram = {};
										$scope.newProgram.classes = [];
										$scope.newProgram.ranks = [];
										ProgramSvc.reset();
										$state.go('admin.programs.home');
									});
								});
						});
					})(classIDs, rankIDs);
				});

				function addNewClasses(callback, err) {
					//Add classes
					async.each($scope.newProgram.classes,
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

/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.isClassValid = function() {
				var classNames = _.map($scope.newProgram.classes, function(c) { return c.name; });
				return !$scope.isEmpty($scope.newClass.name) && !_.contains(classNames, $scope.newClass.name);
			};

			$scope.isRankValid = function() {
				var rankNames = _.map($scope.newProgram.ranks, function(r) { return r.name; });
				var rankOrders = _.map($scope.newProgram.ranks, function(r) { return r.rankOrder; });
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