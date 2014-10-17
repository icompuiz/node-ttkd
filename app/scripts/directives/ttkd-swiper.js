define(['./module'], function(directives){
	'use strict';

	return directives.directive('ttkdSwiper', ['$log', function ($log) {

		var ttkdSwiper = {
			restrict: 'A',
			templateUrl: 'partials/checkin/ttkd-swiper',

			controller: function($scope, ProgramSvc, ClassSvc) {
				// do controller work here for directive
				$scope.classContinue = function() {
					$log.log('continue button clicked');
				}

				loadProgramsAndClasses();

				function loadProgramsAndClasses() {
					var data = [];

					ProgramSvc.list().then(function(programs){
						async.parallel([
							function(callback, err){
								//Get class objects and put into programs
								ClassSvc.list().then(function(classes){
									var i;
									for(i=0; i<programs.length; i++) {
										programs[i].classes = _.where(classes, {'program': programs[i]._id});
									}
									callback();
								});
							}],

							function(err){
								_.each(programs, function(p){
									data.push({
										'classObjs': p.classes,
										'name': p.name,
										'classNames': _.map(p.classes, function(c){return c.name;}),
										'_id': p._id
									});
								});

								$scope.data = data;
							}
						);
					});
				}
			},

			link: function($scope) {
				$scope.$watch('data', function() {

					var lateralSwipersNested = [];

					var swiperParent = new Swiper('.swiper-parent', {
						mode: 'vertical',
						slidesPerView: 3,
						centeredSlides: true,
						watchActiveIndex: false
					});

					$scope.swiperParent = swiperParent;

					var lateralHeight;

					//calculateHeight not working... quick/hacky fix
					function resizeLateralSlides(swiper, newHeight) {
						for(i=0; i<swiper.slides.length; i++) {
							swiper.slides[i].style.height = newHeight;
						}
					}

				}, true);
			}
		};

		return ttkdSwiper;
	}])

	.directive('ttkdSwiperLateralItem', ['$log', function($log) {
		var ttkdSwiperLateralItem = {
			restrict: 'A',
			scope: {
				parent: '=',
				swiperId: '='
			},

			controller: function() {},

			link: function($scope) {
				var program = $scope.item;
				var swiperParent = $scope.parent;
				var slideClassName = '.swiper-nested-' + $scope.swiperId;

				//create a parent swiper for vertical movement
				// var lateralSwiperWrapper = swiperParent.createSlide('<div class="swiper-container nested '+slideClassName+'"><div class="swiper-wrapper nested"></div></div>', 'swiper-slide');

				// var rowTitle = document.createElement('h2');
				// rowTitle.innerText = program.name;
				// rowTitle.className = 'title';

				// swiperParent.container.firstElementChild.appendChild(rowTitle);

				// lateralSwiperWrapper.append();

				var newLateralSwiper = new Swiper(slideClassName, {
					mode: 'horizontal',
					slidesPerView: 4,
					centeredSlides: true,
					watchActiveIndex: true,
					resistance: '100%'
				});
				// lateralSwipersNested.push(newLateralSwiper);

				// if(swiperParent.slides.length > 0){
				// 	lateralHeight = swiperParent.slides[0].style.height;
				// }

				// for(var j=0; j<program.classObjs.length; j++) {
				// 	var button = '<button type="button" class="btn btn-primary btn-lg" ng-click="classContinue">Continue</button>';

				// 	var newHSlide = newLateralSwiper.createSlide('d', 'swiper-slide red-slide');
				// 	newHSlide.append();
				// 	resizeLateralSlides(newLateralSwiper, lateralHeight);
				// }
			}
		};

		return ttkdSwiperLateralItem;
	}])

	.directive('ttkdSwiperSlideItem', ['$log', function($log) {
		var ttkdSwiperSlideItem = {
			restrict: 'A',
			scope: {
				item: '=ttkdSwiperSlideItem'
			},

			controller: function() {},

			link: function($scope) {
				var clazz = $scope.item;

			}
		};

		return ttkdSwiperSlideItem;
	}]);

});