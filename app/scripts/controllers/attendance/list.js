define(['../module'], function(controllers) {
    'use strict';

    controllers.controller('ListAttendanceCtrl', ['$scope', '$modal', '$http', '$log', '$state', '$filter', 'saveAs', 'AttendanceSvc', 'StudentSvc', 'WorkshopSvc', 'ClassSvc', 'ProgramSvc', 'AchievementSvc', 'RankSvc',
        function($scope, $modal, $http, $log, $state, $filter, saveAs, AttendanceSvc, StudentSvc, WorkshopSvc, ClassSvc, ProgramSvc, AchievementSvc, RankSvc) {
            var defaultColumnDefs = [
                    { field: 'checkInTime', displayName: 'Check-in Time', cellFilter: 'dateTime'},
                    { field: 'fullName', displayName: 'Student'},
                    { field: 'eventName', displayName: 'Event Attended'},
                    { sortable: false, displayName: 'Actions', cellTemplate: '/partials/attendance/list/studentViewButton'}
                ],
                studentColumnDefs = [
                    { field: 'checkInTime', displayName: 'Check-in Time', cellFilter: 'dateTime'},
                    { field: 'eventName', displayName: 'Event Attended'},
                    { field: 'achievementNames', displayName: 'Achievement(s)', cellFilter: 'stringArray'},
                    { sortable: false, displayName: 'Actions', cellTemplate: '/partials/attendance/list/studentAttendanceButtons', minWidth: '250'}
                ],
                classColumnDefs = [
                    { field: 'name', displayName: 'Class Name'},
                    { field: 'programName', displayName: 'Program'},
                    { sortable: false, displayName: 'Actions', cellTemplate: '/partials/attendance/list/classViewButton'}
                ],
                workshopColumnDefs = [
                    { field: 'name', displayName: 'Workshop Name'},
                    { field: 'workshopDate', displayName: 'Date', cellFilter: 'dateTime'},
                    { field: 'numAttendees', displayName: 'Attendees'},
                    { sortable: false, displayName: 'Actions', cellTemplate: '/partials/attendance/list/workshopViewButton'}
                ];

            var emails = [];

            $scope.allData = [];
            $scope.filterStudent = {};
            $scope.studentTab = {};

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

            $scope.columnDefs = defaultColumnDefs;

            $scope.showRemoveConfirm = [];

            function resetNewTab() {
                $scope.viewingStudent = false;
                $scope.viewingClass = false;
                $scope.viewingWorkshop = false;

                $scope.currentClass = null;
                $scope.currentStudent = null;
                $scope.currentWorkshop = null;              
            }

            $scope.selectStudents = function() {
                resetNewTab();

                $scope.columnDefs = defaultColumnDefs;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            };

            $scope.selectClasses = function() {
                resetNewTab();

                $scope.columnDefs = classColumnDefs;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);             
            };

            $scope.selectWorkshops = function() { 
                resetNewTab();

                $scope.columnDefs = workshopColumnDefs;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);             
            };

            $scope.viewStudentAttendance = function(row) {
                StudentSvc.read(row.entity.student, null, false).then(function(student) {
                    $scope.studentTab.active = true;
                    $scope.currentStudent = student;
                    $scope.currentStudent.fullName = student.firstName + ' ' + student.lastName;
                    $scope.viewingStudent = true;
                    $scope.columnDefs = studentColumnDefs;
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, {student: row.entity.student});
                });
            };

            $scope.viewClassAttendance = function(row) {
                $scope.currentClass = row.entity.name;
                $scope.viewingClass = true;
                $scope.columnDefs = defaultColumnDefs;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, {classAttended: row.entity._id});
            };

            $scope.viewWorkshopAttendance = function(row) {
                $scope.currentWorkshop = row.entity.name;
                $scope.viewingWorkshop = true;
                $scope.columnDefs = defaultColumnDefs;
                $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, {classAttended: row.entity._id});
            };

            $scope.searchByStudent = function() {
                var data = [];

                if (!$scope.filterStudent.name || $scope.filterStudent.name.length === 0) {
                    data = $scope.allData;
                } else {
                    var searchCriteria = $scope.filterStudent.name.toLowerCase();

                    _($scope.allData).forEach(function(attendance) {
                        if (attendance.fullName.toLowerCase().indexOf(searchCriteria) > -1) {
                            data.push(attendance);
                        }
                    });
                }                
                $scope.setPagingData(data, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
            };

            $scope.$watch('filterStudent.name', function() {
                $scope.searchByStudent();
            });


            $scope.sortInfo = {fields: ['id'], directions: ['asc']};

            $scope.$watch('sortInfo', function(newVal, oldVal){
                if (newVal.fields[0] === oldVal.fields[0] && newVal.directions[0] === oldVal.directions[0]) {
                    return;
                }

                sortData(newVal.fields[0], newVal.directions[0]);
                $scope.pagingOptions.currentPage = 1;
                $scope.setPagingData($scope.allData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
            }, true);

            function sortData(field, direction) {
                if(!$scope.allData) return;

                $scope.allData.sort(function(a, b) {
                    if(direction === 'asc') {
                        return a[field] > b[field] ? 1 : -1;
                    } else {
                        return a[field] > b[field] ? -1 : 1;
                    }
                });
            }

            $scope.setPagingData = function(data, page, pageSize){
                var pagedData = data.slice((page - 1) * pageSize, page * pageSize);
                $scope.myData = pagedData;
                $scope.totalServerItems = data.length;
                if (!$scope.$$phase) {
                    $scope.$apply();
                }
            };

            $scope.getPagedDataAsync = function (pageSize, page, filterOptions, useCachedData) {
                setTimeout(function () {
                    if (useCachedData) {
                        $scope.setPagingData($scope.allData, $scope.pagingOptions.currentPage, $scope.pagingOptions.pageSize);
                        return;
                    }

                    var data = [];
                    var studentIds = [];
                    var attendances = [];

                    function populateClassAttendanceGrid() {
                        ClassSvc.list().then(function(classes) {
                            async.each(classes,
                                function(classItem, callback) {
                                    ProgramSvc.read(classItem.program, null, false).then(function(program) {
                                        if (!program) {
                                            callback();
                                            return;
                                        }

                                        classItem.programName = program.name;
                                        data.push(classItem);
                                        callback();
                                    });
                                },
                                function(err) {
                                    $scope.setPagingData(data,page,pageSize);
                            });
                        });
                    }

                    function populateWorkshopAttendanceGrid() {
                        WorkshopSvc.list().then(function(workshops) {
                            _(workshops).forEach(function(workshop) {
                                workshop.numAttendees = _.where(attendances, {classAttended: workshop._id}).length;
                                data.push(workshop);
                            });
                            $scope.setPagingData(data,page,pageSize);
                        });
                    }

                    function populateStudentAttendanceGrid() {
                        //attendances = _.where(attendances, filterOptions); //using filterOptions as list() param didn't work
                        var count = 0;
                        async.each(attendances,
                            function(attendance, callback) {
                                StudentSvc.read(attendance.student, null, false).then(function(student) { // Retrieve and attach student name to attendance obj
                                    if (!student) {
                                        return;
                                    }
                                    attendance.fullName = student.firstName + ' ' + student.lastName;

                                    AchievementSvc.list().then(function(achievements) {
                                        achievements = _.where(achievements, {'attendance': attendance._id});

                                        var achievementObjs = [];
                                        async.each(achievements,
                                            function(ach, callback) {
                                                RankSvc.read(ach.rank, null, false).then(function(rank) {
                                                    ach.name = rank.name;
                                                    achievementObjs.push(ach);
                                                    callback();
                                                });
                                            },
                                            function(err) {
                                                attendance.achievementObjs = achievementObjs;
                                                attendance.achievementNames = _.map(achievementObjs, function(a){return a.name;});

                                                // Attach achievement name(s) to attendance object
                                                 if (attendance.workshop) {
                                                    WorkshopSvc.read(attendance.classAttended, null, false).then(function(workshop) {
                                                        attendance.eventName = workshop.name;
                                                        attendance.i = count;
                                                        count++;
                                                        data.push(attendance);
                                                        callback();
                                                    });
                                                } else {
                                                    attachRankData(attendance, callback);
                                                }
                                            });
                                    });
                                });
                            },
                            function(err) {
                                $scope.setPagingData(data,page,pageSize);
                                $scope.showRemoveConfirm = new Array(count);
                                for (var i = 0; i < $scope.showRemoveConfirm.length; ++i) { $scope.showRemoveConfirm[i] = false; }
                        }); 
                    }

                    function populateDefaultAttendanceGrid() {
                        emails = [];
                        // add attendances to new array for ng-grid outputting
                        async.each(attendances,
                            function(attendance, callback) {
                                if (!filterOptions || (filterOptions.classAttended && attendance.classAttended === filterOptions.classAttended)) {
                                    StudentSvc.read(attendance.student, null, false).then(function(student) {
                                        if (!student) {
                                            callback();
                                            return;
                                        }

                                        if (filterOptions && $scope.viewingWorkshop) {
                                            _(student.emailAddresses).forEach(function(email) {
                                                if (!_.contains(emails, email)) {
                                                    emails.push(email);
                                                }
                                            });
                                        }
                                        attendance.fullName = student.firstName + ' ' + student.lastName;

                                        if (attendance.workshop) {
                                            WorkshopSvc.read(attendance.classAttended, null, false).then(function(workshop) {
                                                attendance.eventName = workshop.name;
                                                data.push(attendance);
                                                callback();
                                            });
                                        } else {
                                            ClassSvc.read(attendance.classAttended, null, false).then(function(classObj) {
                                                attendance.eventName = classObj.name;
                                                data.push(attendance);
                                                callback();
                                            });
                                        }
                                    });
                                } else {
                                    callback();
                                }
                            },
                            function(err) {
                                $scope.allData = data;
                                $scope.setPagingData(data,page,pageSize);
                        }); 
                    }

                    function attachRankData(attendance, callback) {
                        ClassSvc.read(attendance.classAttended, null, false).then(function(classObj) {
                            attendance.eventName = classObj.name;

                            // Attach rank data for adding achievements
                            RankSvc.list().then(function(ranks) {
                                var mainRanks = _.where(ranks, {'program': classObj.program});

                                var subranks = _.remove(ranks, function(r) {return r.isIntermediaryRank;});

                               // mainRanks = _.sortBy(mainRanks, function(r) {return r.rankOrder;});                                                                }

                                attendance.sortedRanks = [];
                                attendance.sortedSubranks = [];

                                _(mainRanks).forEach(function(rank) {
                                    var subrankObjs = [];

                                    if (rank.intermediaryRanks) {
                                        _(rank.intermediaryRanks).forEach(function(subrankId) {
                                            var subrank = _.find(subranks, function(rank) {return rank._id === subrankId;});

                                            subrankObjs.push(subrank);
                                            // _(subs).forEach(function(r) {
                                            //     attendance.sortedRanks.push(r);
                                            // });
                                        });
                                        subrankObjs = _.sortBy(subrankObjs, function(r){return r.rankOrder;});

                                        if (subrankObjs.length > 0) {
                                            attendance.sortedSubranks.push(subrankObjs);
                                        }
                                    }
                                    if (!rank.isIntermediaryRank) {
                                        attendance.sortedRanks.push(rank);
                                    }
                                });

                                data.push(attendance);
                                callback();
                            });
                        });
                    }

                    StudentSvc.list().then(function(students) {
                        studentIds = _.map(students, function(s) { return s._id; });

                        AttendanceSvc.list(filterOptions).then(function(allAttendances) {
                            _(allAttendances).forEach(function(attendance) {
                                var found = _.find(studentIds, function(s) { return s == attendance.student; });

                                if ( found ) {
                                    attendances.push(attendance);
                                }
                            });

                            if ($scope.columnDefs === classColumnDefs) { // Clicked the class tab
                                populateClassAttendanceGrid();

                            } else if ($scope.columnDefs === workshopColumnDefs) { // Clicked the workshops tab
                                populateWorkshopAttendanceGrid();
                                
                            } else if ($scope.columnDefs === studentColumnDefs) { // Viewing a student's attendace records
                                populateStudentAttendanceGrid();

                            } else { // Viewing the default ng-grid
                                populateDefaultAttendanceGrid();
                            }
                        });
                    });
                }, 100);
            };

            $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
            $scope.$watch('pagingOptions', function (newVal, oldVal) {
                if (newVal !== oldVal && newVal.currentPage !== oldVal.currentPage) {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText, true);
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
                sortInfo: $scope.sortInfo,             
                enableRowSelection: false,
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                columnDefs: defaultColumnDefs
            };

            $scope.classGridOptions = {
                data: 'myData',
                rowHeight: 40,
                enablePaging: true,
                showFooter: true,
                enableRowSelection: false,
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                columnDefs: classColumnDefs
            };

            $scope.workshopGridOptions = {
                data: 'myData',
                rowHeight: 40,
                enablePaging: true,
                showFooter: true,
                enableRowSelection: false,
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                columnDefs: workshopColumnDefs
            };

            $scope.studentGridOptions = {
                data: 'myData',
                rowHeight: 40,
                enablePaging: true,
                showFooter: true,
                enableRowSelection: false,
                totalServerItems: 'totalServerItems',
                pagingOptions: $scope.pagingOptions,
                filterOptions: $scope.filterOptions,
                selectedItems: [],
                columnDefs: studentColumnDefs
            };

            $scope.removeAttendanceEntry = function(a) {
                $scope.showRemoveConfirm[a.i] = true;
            };

            $scope.confirmRemove = function(row, remove) {
                if(remove) {
                    //Remove attendance entry from db
                    AttendanceSvc.read(row.entity._id, null, true).then(function(att){
                        AttendanceSvc.remove().then(function() {
                             $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, {student: row.entity.student});
                        });
                    });
                    $scope.showRemoveConfirm[row.entity.i] = false;
                } else {
                    $scope.showRemoveConfirm[row.entity.i] = false;
                }
            };

            $scope.editAchievements = function(attendance) {
                var modalInstance = $modal.open({
                    templateUrl: '/partials/attendance/list/achievementModal',
                    controller: 'AchievementCtrl',
                    size: 'lg',
                    resolve: {
                        attendanceInfo: function() {
                            return attendance;
                        }
                    }
                });

                modalInstance.result.then(function () {
                    $scope.getPagedDataAsync($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, {student: attendance.student});
                }, function () {});
            };

            function writeEmailList() {
                var studentFile = '';
                var d = new Date(),
                    year = d.getFullYear(),
                    month = d.getMonth()+1,
                    day = d.getDate();

                var filename = $scope.currentWorkshop + '_emails_' + month + '-' + day + '-' + 
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
            };
        }
    ]);
});