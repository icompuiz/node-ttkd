define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('EditRankCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'Restangular', 'RankSvc', 'ProgramSvc',
		function($rootScope, $scope, $state, $stateParams, Restangular, RankSvc, ProgramSvc) {
			$scope.rank = {};
			$scope.swapRank = {};
			$scope.dropdown = {
				isOpen: false
			};
			var program = {};

			var orig = null;

			function setDropdownItems() {
				var ordered = _.sortBy(program.rankObjs, 'rankOrder');
				var orders = _.map(ordered, function(r){return r.rankOrder;});

				$scope.dropdown.items = orders;
			}

			// load current program and rank if available from services
			if (RankSvc.current && RankSvc.editing) {
				$scope.rank = RankSvc.current;
				program = ProgramSvc.current;
				if (!RankSvc.orig) {
					RankSvc.orig = {
						name: RankSvc.current.name
					};
					orig = RankSvc.orig;
				}
				program.populated = true;
				setDropdownItems();
			// Otherwise get them from db
			} else if ($stateParams.id) { 
				RankSvc.read($stateParams.id, null, true).then(function(r) {
					$scope.rank = RankSvc.current;
					RankSvc.orig = {
						name: r.name
					};
					orig = RankSvc.orig;
					ProgramSvc.read(r.program, null, true).then(function(p) {
						var rankObjs = [];

						async.each(p.ranks,  // Attach rank objects to current program
							function(rId, callback) {
								RankSvc.read(rId, null, false).then(function(r) {
									rankObjs.push(r);
									callback();
								});
							},
							function(err) {
								program = p;
								program.rankObjs = rankObjs;
								program.populated = true;
								setDropdownItems();
							}
						);
					});
				});					
			}

			// For new ranks, initialize to the last rankOrder for the program
			if (!$scope.rank.rankOrder && program.rankObjs) {
				$scope.rank.rankOrder = program.rankObjs.length + 1;
			}

			$scope.setRankOrder = function(newVal) {
				if (!$scope.origRankOrder) {
					$scope.origRankOrder = $scope.rank.rankOrder;
				}

				var found = _.find(program.rankObjs, function(o){return o.rankOrder === newVal;});
				if (found && found.name !== orig.name) {
					$scope.swapRank = found;
					$scope.swapRank.newRankOrder = $scope.origRankOrder;
					$scope.showOrderWarning = true;
				} else {
					$scope.showOrderWarning = false;
				}

				$scope.rank.rankOrder = newVal;

				// HACK to close bootstrap dropdown after Item is selected
				// otherwise the dropdown menu stays open after item selection any time
				// after the initial selection
				$('[data-toggle="dropdown"]').parent().removeClass('open');
			};

			function goToPrevState() {
				if (!$rootScope.previousState) {
					$state.go('admin.programs.edit', {id: $scope.rank.program});
				} else if ($rootScope.previousParams) {
					$state.go($rootScope.previousState, $rootScope.previousParams);
				} else {
					$state.go($rootScope.previousState);
				}
			}


			$scope.cancelEdit = function() {

				RankSvc.reset();
				RankSvc.orig = null;

				goToPrevState();
			};

			$scope.saveRank = function() {
				//Find the original rank in the program and replace it with the edited rank
				var i = _.findIndex(program.rankObjs, function(r) {
					return r.name === RankSvc.orig.name;
				});
				if (i >= 0) {
					program.rankObjs[i] = $scope.rank;
				} else {
					program.rankObjs.push($scope.rank);
				}

				//Perform the rank order swap if necessary
				if ($scope.showOrderWarning) {
					$scope.swapRank.rankOrder = $scope.swapRank.newRankOrder;
				}

				RankSvc.reset();
				RankSvc.orig = null;

				goToPrevState();
				
			};



/********************** Form Validation **********************************/

			$scope.isEmpty = function(str) {
				return (!str || 0 === str.length);
			};

			$scope.canSaveRank = function() {
				return !$scope.isEmpty($scope.rank.name) && !$scope.isDupName();
			};

			$scope.isDupName = function() {
				var names = [];
				if (program && program.populated && orig) {
					names = _.map(program.rankObjs, function(r){return r.name;});
					names = _.without(names, orig.name);
				}

				return _.contains(names, $scope.rank.name);
			};
	}]);
});	