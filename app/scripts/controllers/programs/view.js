define(['../module'], function(controllers){
	'use strict';
	controllers.controller('ViewProgramCtrl', ['$scope', '$state', '$stateParams', 'Restangular', 'ProgramSvc', 'ClassSvc',
		function($scope, $state, $stateParams, Restangular, ProgramSvc, ClassSvc) {
			$scope.currentProgram = {};

			if (ProgramSvc.current && ProgramSvc.viewing) {
				$scope.currentProgram = ProgramSvc.current;
			} else if ($stateParams.id) {
				ProgramSvc.read($stateParams.id, null, true).then(function(p) { 
					$scope.currentProgram = p;
					ClassSvc.list().then(function(classes) {
						$scope.currentProgram.classObjs = _.where(classes, {program: $scope.currentProgram._id});
					});
				});
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
/******** END Class Grid Options *************************************************/

			$scope.goToViewClass = function(row) {
				ClassSvc.init(row.entity);
				ClassSvc.startViewing();
				$state.go('admin.programs.viewclass', {id: row.entity._id});
			};

			$scope.backToHome = function() {
				ProgramSvc.reset();
				$state.go('admin.programs.home');
			};

	}]);
});	