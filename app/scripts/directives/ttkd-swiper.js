define(['./module'], function(directives){
	'use strict';

	return directives.directive('ttkdSwiper', ['$log', '$compile', function ($log, $compile) {
		var compileHack = $compile;
		var rcvd = false;
		var ttkdSwiper = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper',
			scope: {
				type: '=',
				selectedClassId: '='
			},

			controller: function($scope, ProgramSvc, ClassSvc, StudentSvc, $compile) {
				// Load data based on type

				// store students so we don't need to reload
				$scope.allStudents = [];

				if($scope.type === 'students' && $scope.selectedClassId) {
					$log.log('Attempting to load students...');
					loadStudents($scope.selectedClassId);
				} else {
					$log.log('Attempting to load programs...');
					loadProgramsAndClasses();
				}



				function loadStudents(selectedClassId) {
					ClassSvc.read(selectedClassId, {populate: 'students'}, false).then(function(classDoc){
						$scope.data = {
							students: classDoc.students,
							type: 'students'
						};
					});
				}

				function loadProgramsAndClasses() {
					var data = [];

					ProgramSvc.list({populate: 'classes'}).then(function(programs) {
						_.each(programs, function(program) {
							data.push({
								'classObjs': program.classes,
								'name': program.name,
								'classNames': _.map(program.classes, function(c){return c.name;}),
								'_id': program._id
							});
						});

						$scope.data = {
							classes: _.clone(data),
							type: 'class'
						}
					});
				};

				$scope.filterStudents = function(filter, filterParam) {
					var maxLateralSlideDeck = 9;
					var allStudents = _.clone($scope.data.students);
					var filtered = allStudents;

					if(filter) {
						filtered = _.filter(data, function (student) {
							return _.contains(filter, student[filterParam][0]);
						});
					}

					if(filterParam) {
						// and sort...
						filtered = _.sortBy(filtered, function(student) {
							return student[filterParam];
						});
					}

					$scope.studentsFiltered = [];
					var returnableFiltered = $scope.studentsFiltered;
					var filteredLength = filtered.length;
					var neededLaterals = Math.ceil(filteredLength / maxLateralSlideDeck);

					for(var i=0; i<neededLaterals; i++) {
						var howMany;
						if(i+1 === neededLaterals) {
							howMany = filteredLength - (i * maxLateralSlideDeck);
						} else {
							howMany = maxLateralSlideDeck;
						}

						returnableFiltered.push({
							students: filtered.splice(0, howMany)
						});
					}

					$scope.studentsFiltered = returnableFiltered;
				};
			},

			link: function($scope, element) {
				$scope.$watch('data', function() {
					if(!$scope.data){
						return;
					}

					var swiperParent;

					if($scope.type === 'students') {
						swiperParent = new Swiper('.swiper-parent', {
							mode: 'horizontal',
							grabCursor: true
						});
					} else {
						if($scope.data.length == 0) {
							return;
						}

						swiperParent = new Swiper('.swiper-parent', {
							mode: 'vertical',
							slidesPerView: 3,
							centeredSlides: true,
							watchActiveIndex: true,
							grabCursor: true
						});
					}

					$scope.swiperParent = swiperParent;
				}, true);
			}
		};

		return ttkdSwiper;
	}])




	.directive('ttkdSwiperLateralItemClass', ['$log', '$compile', function($log, $compile) {
		var compileHack = $compile;

		var ttkdSwiperLateralItemClass = {
			restrict: 'A',
			scope: {
				parent: '=',
				item: '=',
				swiperId: '=',
				type: '='
			},

			controller: ['$scope', function($scope) {}],

			link: function($scope, element) {
				var item = $scope.item;
				var swiperParent = $scope.parent;
				var slideClassName = 'swiper-nested-' + $scope.swiperId;

				//create a parent swiper for horizontal movement
				var rowTitle = '<div class="title">' + item.name + '</div>';
				var lateralSwiperWrapper = swiperParent.createSlide(rowTitle + '<div class="swiper-container nested '+slideClassName+'"><div class="swiper-wrapper nested"></div></div>', 'swiper-slide');
				//var lateralSwiperWrapper = swiperParent.createSlide('<div style="color:black">TY</div>', 'swiper-slide');

				lateralSwiperWrapper.append();

				swiperParent.hit = 'hit';

				var newLateralSwiperWrapper = new Swiper('.' + slideClassName, {
					mode: 'horizontal',
					slidesPerView: 4,
					centeredSlides: true,
					watchActiveIndex: true,
					resistance: '100%'
				});

				var lateralHeight;
				if(swiperParent.slides.length > 0){
					lateralHeight = swiperParent.slides[0].style.height;
				}

				$scope.classes = {};

				for(var j=0; j<item.classObjs.length; j++) {
					var className = item.classObjs[j].name;
					var classId = item.classObjs[j]._id;
					$scope.classes[classId] = item.classObjs[j];
					//name="\''+className+'\'"
					var newHSlide = newLateralSwiperWrapper.createSlide('<div ttkd-swiper-slide-item-class classes="classes" id="\''+classId+'\'"></div>', 'swiper-slide');
					newHSlide.append();
					compileHack(newHSlide)($scope);
					resizeLateralSlides(newLateralSwiperWrapper, lateralHeight);
				}

				//calculateHeight not working... quick/hacky fix
				function resizeLateralSlides(swiper, newHeight) {
					for(var i=0; i<swiper.slides.length; i++) {
						swiper.slides[i].style.height = newHeight;
					}
				}
			}
		};

		return ttkdSwiperLateralItemClass;
	}])

	.directive('ttkdSwiperLateralItemStudent', ['$log', '$compile', function($log, $compile) {
		var compileHack = $compile;

		var ttkdSwiperLateralItemStudent = {
			restrict: 'E',
			replace:true,
			scope: {
				parent: '=',
				items: '=',
				swiperId: '=',
				type: '=',
				filteredStudents: '='
			},

			controller: ['$scope', function($scope) {}],

			link: function($scope, element) {
				$scope.$watch('filteredStudents', function() {
					var swiperParent = $scope.parent;
					$scope.swiperParent = swiperParent;

					if(!$scope.filteredStudents) {
						return;
					}

					// Remove all existing slides from parent to re-add
					swiperParent.removeAllSlides();

					// Now we can re-add slides with updated data
					var studentsCopy = _.clone($scope.filteredStudents);

					// Used to get the student when the individual student directive is called... mapped with his id
					$scope.students = [];

					// each studentSubset will contain 9 students
					_(studentsCopy).forEach(function(studentSubset) {
						// Generate inner template for 9 subset display
						var nineStudentsHtml = '';
						_(studentSubset.students).forEach(function(student) {
							var studentId = student._id;
							$scope.students[studentId] = student;

							var studentHtml = '';
							studentHtml += '<div class="col-md-4" style="height: 33%; padding: 15px;">' + '\n';
							studentHtml += '  <div class="height-full panel" ttkd-swiper-slide-item-student students="students" id="\''+studentId+'\'" style="padding:10px;">' + '\n';
							studentHtml += '  </div>' + '\n';
							studentHtml += '</div>' + '\n';

							nineStudentsHtml += studentHtml;
						});

						var nineStudents = swiperParent.createSlide(nineStudentsHtml, 'swiper-slide');
						nineStudents.append();

						compileHack(nineStudents)($scope);
					});

					swiperParent.swipeTo(0);
				}, true);
			}
		};

		return ttkdSwiperLateralItemStudent;
	}])

	.directive('ttkdSwiperSlideItemClass', ['$log', '$state', function($log, $state) {
		var ttkdSwiperSlideItemClass = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper-card-class',
			scope: {
				classId: '=id',
				classes: '='
			},
			replace:true,

			controller: function($scope) {
				$scope.className = $scope.classes[$scope.classId].name;
				$scope.classContinue = function() {
					$log.log('hit again ' + $scope.classId);
					$state.go('checkin.home.unranked', {id: $scope.classId});
				}
			},

			link: function($scope) {}
		};

		return ttkdSwiperSlideItemClass;
	}])

	.directive('ttkdSwiperSlideItemStudent', ['$log', function($log) {
		var ttkdSwiperSlideItemStudent = {
			restrict: 'A',
			templateUrl: 'partials/checkin/class/students',
			scope: {
				students: '=',
				studentId: '=id'
			},
			replace:true,

			controller: function($scope) {
				var student = $scope.students[$scope.studentId];
				$scope.studentName = student.firstName + ' ' + student.lastName;
				$scope.studentAvatar = student.avatar;
				$scope.studentContinue = function() {
					$log.log('hit again student ' + studentId);
				}
			},

			link: function($scope, element) {
				$log.log('t');
			}
		};

		return ttkdSwiperSlideItemStudent;
	}]);

});