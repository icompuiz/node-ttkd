define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('ViewRankCtrl', ['$rootScope', '$scope', '$state', '$stateParams', 'Restangular', 'RankSvc', 'ProgramSvc',
		function($rootScope, $scope, $state, $stateParams, Restangular, RankSvc, ProgramSvc) {
			$scope.rank = {};
			$scope.program = {};
            $scope.intermediaryRankNames = [];

            function attachSubranks(callback) {
                var subrankObjs = [];
                async.each($scope.rank.intermediaryRanks,
                    function(subrankId, callback) {
                        RankSvc.read(subrankId, null, false).then(function(subrank) {
                            // Attach sub-rank identifiers
                            subrank.divId = 'r' + subrank._id;

                            subrankObjs.push(subrank);
                            callback();
                        });
                    },
                    function(err) {
                        $scope.rank.subrankObjs = subrankObjs;
                        callback();
                });
            }

			// load current program and rank if available from services
			if (RankSvc.current && RankSvc.viewing) {
				$scope.rank = RankSvc.current;
				$scope.program = ProgramSvc.current;
                $scope.intermediaryRankNames = _.map($scope.rank.subrankObjs, function(r) {return r.name;});
			// Otherwise get them from db
			} else if ($stateParams.id) { 
				RankSvc.read($stateParams.id, null, true).then(function(r) {
					$scope.rank = RankSvc.current;
                    attachSubranks(function() {
                        $scope.intermediaryRankNames = _.map($scope.rank.subrankObjs, function(r) {return r.name;});
                    });
					ProgramSvc.read(r.program, null, true).then(function(p) {
						$scope.program = p;
					});
				});					
			}

			if ($scope.rank.color) {
				$('.color-tile').css('background', $scope.rank.color);
			}    

			$scope.filterOptions = {
                filterText: '',
                useExternalFilter: true
            };

            $scope.totalServerItems = 0;

            $scope.pagingOptions = {
                pageSizes: [25, 50, 100, 250, 500, 1000],
                pageSize: 25,
                currentPage: 1
            };

            $scope.setPagingData = function(data, page, pageSize){
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.myData = pagedData;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.getPagedData = function (pageSize, page) {
                var data = [];
                _($scope.rank.intermediaryRanks).forEach(function(r) {
                	data.push(r);
                });
             	$scope.setPagingData(data,page,pageSize);               
            };

            if ($scope.rank.intermediaryRanks) {
                $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            }

            $scope.$watch('pagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);

            $scope.$watch('filterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getPagedData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);

            $scope.gridOptions = {
                data: 'myData',
                rowHeight: 40,
                enablePaging: true,
                showFooter: true,
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                sortInfo: { fields: ['lastName', 'firstname'], directions: ['asc', 'asc'] },
                columnDefs: [
                    { field: 'name', displayName: 'Rank Name' },
                    { field: 'rankOrder', displayName: 'Order' },
                    { cellTemplate: '/partials/students/list/viewButton', sortable: false },
                ]
            };

            $scope.view = function(row){
            	RankSvc.init(row.entity);
                $state.go('admin.programs.viewrank');
            };

			function goToPrevState() {
                if (ProgramSvc.editing) {
                    $state.go('admin.programs.edit', {id: ProgramSvc.current._id});
                } else if (ProgramSvc.creating) {
                    $state.go('admin.programs.create', {id: ProgramSvc.current._id});
                } else if (ProgramSvc.viewing) {
                    $state.go('admin.programs.view', {id: ProgramSvc.current._id});
                } else if ($rootScope.previousState && $rootScope.previousParams) {
                    $state.go($rootScope.previousState, $rootScope.previousParams);
                } else if ($rootScope.previousState) {
                    $state.go($rootScope.previousState);
                } else { // Default to the programs home page
                    $state.go('admin.programs.home'); 
                }
			}
	}]);
});	