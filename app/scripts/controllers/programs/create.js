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

			$scope.removeClass = function(classToRemove) { 
				var c = confirm('Are you sure you want to delete ' + classToRemove.name + '?');

				if (c) {
					$scope.newProgram.classes = _.without($scope.newProgram.classes, classToRemove);
				}
			};

			$scope.removeClass = function(rankToRemove) { 
				var c = confirm('Are you sure you want to delete ' + rankToRemove.name + '? You will not be able to undo this operatio');

				if (c) {
					$scope.newProgram.ranks = _.without($scope.newProgram.ranks, rankToRemove);
				}
			};

			$scope.addClassToProgram = function(program) {
				program.classes.push($scope.newClass);
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

			$scope.goToEditClass = function(clss) {
				ClassSvc.init(clss);
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
									ProgramSvc.update(updates).then(function(updated) {		
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

			$scope.canSaveProgram = function() {
				return !$scope.isEmpty($scope.newProgram.name);
			};

	}]);
});	