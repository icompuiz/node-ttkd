define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ViewProgramCtrl', ['$rootScope', '$window', '$scope', '$state', '$stateParams', 'Restangular', 'ProgramSvc', 'ClassSvc', 'RankSvc',
		function($rootScope, $window, $scope, $state, $stateParams, Restangular, ProgramSvc, ClassSvc, RankSvc) {
			$scope.currentProgram = {};

			function attachClassAndRankObjs(){
				//Attach class objects to current program
				ClassSvc.list().then(function(classes) {
					$scope.currentProgram.classObjs = _.where(classes, {program: $scope.currentProgram._id});
				});
				//Attach rank objects to current program
				RankSvc.list().then(function(ranks) {
					$scope.currentProgram.rankObjs = _.where(ranks, {program: $scope.currentProgram._id});
				});				
			}

			function setTab() {
				if ($rootScope.previousState.indexOf('rank') > -1) {// Show ranks tab if the previous state contains 'rank'
					$scope.showRanks = true;
				} else {
					$scope.showClasses = true;
				}
			}
			setTab();

			if (ProgramSvc.current && ProgramSvc.viewing) {
				$scope.currentProgram = ProgramSvc.current;
				attachClassAndRankObjs()
			} else if ($stateParams.id) {
				ProgramSvc.read($stateParams.id, null, true).then(function(p) { 
					$scope.currentProgram = p;
					attachClassAndRankObjs()
				});
				ProgramSvc.startViewing();
			}
			
			if (ProgramSvc.current && ProgramSvc.viewing) {
				$scope.currentProgram = ProgramSvc.current;
			} 

/******** Class Grid Options ****************************************************/
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
                showFooter: true,
                enableRowSelection: false,
                totalServerItems: 'classTotalServerItems',
                pagingOptions: $scope.classPagingOptions,
                filterOptions: $scope.classFilterOptions,
                selectedItems: [],
                sortInfo: { fields: ['name'], directions: ['asc'] },
                columnDefs: [
                    { field: 'name', displayName: 'Class Name' },
                    { cellTemplate: '/partials/programs/classes/list/viewOptionsButton', sortable: false, displayName: 'Actions'}
                ]
            };

/******** Rank Grid Options ****************************************************/

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
                showFooter: true,
                enableRowSelection: false,
                totalServerItems: 'rankTotalServerItems',
                pagingOptions: $scope.rankPagingOptions,
                filterOptions: $scope.rankFilterOptions,
                selectedItems: [],
                sortInfo: { fields: ['name'], directions: ['asc'] },
                columnDefs: [
                    { field: 'name', displayName: 'Rank Name' },
                    { field: 'rankOrder', displayName: 'Order'},
                    { cellTemplate: '/partials/programs/ranks/list/viewOptionsButton', sortable: false, displayName: 'Actions'}
                ]
            };

/*********************************************************/

			$scope.goToViewClass = function(row) {
				ClassSvc.init(row.entity);
				ClassSvc.startViewing();
				$state.go('admin.programs.viewclass', {id: row.entity._id});
			};

			$scope.goToViewRank = function(row) {
				RankSvc.init(row.entity);
				RankSvc.startViewing();
				$state.go('admin.programs.viewrank', {id: row.entity._id});
			};

			$scope.back = function() {
				ProgramSvc.reset();
				$state.go('admin.programs.home');
			};

	}]);
});	