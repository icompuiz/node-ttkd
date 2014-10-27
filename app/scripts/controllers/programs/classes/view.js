define(['../../module'], function(controllers){
	'use strict';
	controllers.controller('ViewClassCtrl', ['saveAs', '$filter', '$rootScope', '$scope', '$state', '$stateParams','$log', 'Restangular', 'ProgramSvc', 'ClassSvc','StudentSvc',
		function(saveAs, $filter, $rootScope, $scope, $state, $stateParams, $log, Restangular, ProgramSvc, ClassSvc, StudentSvc) {
			$scope.currentClass = {};
            var program = {},
                emails = [];

            function populateStudentObjs() {
                var data = [];
                _($scope.currentClass.students).forEach(function(id) {
                    StudentSvc.read(id, null, false).then(function(s) {
                        if (!s) {
                            return;
                        }
                        data.push(s);
                        if (s.emailAddresses && s.emailAddresses.length > 0) {
                            _(s.emailAddresses).forEach(function(e) {
                                emails.push(e);
                            });
                        }
                    });
                });
                $scope.currentClass.studentObjs = data;
            }

			if (ClassSvc.current && ClassSvc.viewing) {
				$scope.currentClass = ClassSvc.current;
                populateStudentObjs();              
			} else if ($stateParams.id) {
				ClassSvc.read($stateParams.id, null, true).then(function(_class) {
					$scope.currentClass = _class;
                    ProgramSvc.read(_class.program, null, true);
                    populateStudentObjs();
				});
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

            $scope.getPagedDataAsync = function(pageSize, page, searchText) {
                var data = [];
                if ($scope.currentClass.studentObjs && $scope.currentClass.studentObjs.length > 0) {
                    _.each($scope.currentClass.studentObjs, function(s) {
                        s.age = $filter('age')(s.birthday);
                        data.push(s);
                    });
                }
                $scope.setPagingData(data, page, pageSize);
            };

            function writeEmailList() {
                var studentFile = '';
                var d = new Date(),
                    year = d.getFullYear(),
                    month = d.getMonth()+1,
                    day = d.getDate();

                var filename = $scope.currentClass.name + '_emails_' + month + '-' + day + '-' + 
                                year + '.txt';

                _(emails).forEach(function(e) {
                    studentFile += e + '\r\n';
                });
                
                var blob = new Blob([studentFile], {type: 'text/plain;'});
                saveAs(blob, filename);
            }

            $scope.showGenerateEmailListConfirm = false;

            $scope.generateEmailList = function() {
                $scope.showGenerateEmailListConfirm = true;
            };

            $scope.confirmGenerateEmailList = function(writeList) {
                if (writeList) {
                    writeEmailList();
                }
                $scope.showGenerateEmailListConfirm = false;
            }

            $scope.$watch('currentClass.studentObjs', function () {
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
            }, true);

            $scope.$watch('pagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
                }
            }, true);

            $scope.$watch('filterOptions', function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
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
                    { cellTemplate: '/partials/students/list/studentAvatar', sortable: false, width: 70, height: 70, cellClass: 'grid-student-list-icon-cell' },
                    { field: 'firstName', displayName: 'First Name' },
                    { field: 'lastName', displayName: 'Last Name' },
                    { field: 'age', displayName: 'Age' },
                    { cellTemplate: '/partials/students/list/viewButton', sortable: false },
                ]
            };

            $scope.view = function(row){
                console.log('View student id: ' + row.entity._id);
                $state.go('admin.students.view', {id: row.entity._id});
            };

	}]);
});	