define(['../module'], function (controllers) {

	controllers.controller('CheckinCtrl', ['$scope','$http', '$log', '$state', 'ProgramSvc', 'ClassSvc',
		function($scope, $http, $log, $state, ProgramSvc, ClassSvc) {

		$scope.programsAndClasses = [];

		var lateralSwipersNested = [];

		var swiperParent = new Swiper('.swiper-parent',{
			mode: 'vertical',
			slidesPerView: 3,
			centeredSlides: true,
			watchActiveIndex: true
		});


		var lateralHeight;

		// calculateheight not working... quick/hacky fix
		function resizeLateralSlides(swiper, newHeight) {
			for (i = 0; i < swiper.slides.length; i++) {
		        swiper.slides[i].style.height = newHeight;
		    }
		}

		//load programs/classes
		var test = loadProgramsAndClasses(populateViewsWithData);

		function populateViewsWithData(data) {
			$log.log(data);
			$scope.programsAndClasses = data;

			for(var i=0; i<data.length; i++) {
				var program = data[i];
				var slideClassName = 'swiper-nested-' + i;

				//create a parent swiper for vertical movement
				var lateralSwiperWrapper = swiperParent.createSlide('<div class="swiper-container nested '+slideClassName+'"><div class="swiper-wrapper nested"></div></div>', 'swiper-slide');
				var rowTitle = document.createElement('h2');
				rowTitle.innerText = program.name;
				rowTitle.className = 'title';
				swiperParent.container.firstElementChild.appendChild(rowTitle);

				lateralSwiperWrapper.append();
				var newLateralSwiper = new Swiper('.' + slideClassName, {
					mode: 'horizontal',
					slidesPerView: 4,
					centeredSlides: true,
					watchActiveIndex: true,
					resistance: '100%'
				});
				lateralSwipersNested.push(newLateralSwiper);

				if(swiperParent.slides.length > 0) {
					lateralHeight = swiperParent.slides[0].style.height;
				}

				for(var j=0; j<program.classObjs.length; j++) {
					var button = '<button type="button" class="btn btn-primary btn-lg">Large button</button>';

					var newHSlide = newLateralSwiper.createSlide('<div class="class"><div class="name">'+program.classObjs[j].name+'</div><div class="button">'+button+'</div></div>', 'swiper-slide red-slide');
					newHSlide.append();
					resizeLateralSlides(newLateralSwiper, lateralHeight);
				}
			}
		}

		function loadProgramsAndClasses(cb) {

			var data = [];

			ProgramSvc.list().then(function(programs) {
				async.parallel([
					function(callback, err) {
						//Get class objects and put into programs
						ClassSvc.list().then(function(classes) {
							var i;
							for(i=0; i<programs.length; i++) {
								programs[i].classes = _.where(classes, {'program': programs[i]._id});
							}
							callback();
						});
					}],
					function(err) {
						_.each(programs, function(p) {
							data.push({
								'classObjs': p.classes,
								'name': p.name,
								'classNames': _.map(p.classes, function(c){return c.name;}),
								'_id': p._id
							});
						});

						cb(data);

					}
				);
			});
		}



	}]);

});