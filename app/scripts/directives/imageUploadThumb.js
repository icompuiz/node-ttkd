define(['./module'], function(directives){
	'use strict';

	return directives.directive('imageUploadThumb', ['$log', '$window', function($log, $window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
            }
        };

		var imageUploadThumb = {
			restrict: 'A',
			template: '<canvas/>',
			scope: {
				ngWidth: '=',
				ngHeight: '=',
				ngFile: '=',
				ngPlaceholderHeight: '='
			},

            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = {
                	width: scope.ngWidth,
                	height: scope.ngHeight,
                	file: scope.ngFile,
                	placeholderHeight: scope.ngPlaceholderHeight
                }
                //scope.$eval(attributes.imageUploadThumb);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;

                var canvas = element.find('canvas');
                var reader = new FileReader();

                reader.onload = onLoadFile;
                reader.readAsDataURL(params.file);

                function onLoadFile(event) {
                    var img = new Image();
                    img.onload = onLoadImage;
                    img.src = event.target.result;
                }

                function onLoadImage() {
                    var width = params.width || this.width / this.height * params.height;
                    var height = params.height || this.height / this.width * params.width;
                    canvas.attr({ width: width, height: height });
                    canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);

                    var marginTopBottom = (params.placeholderHeight - $('canvas').height()) / 2;

                    canvas.css('margin', marginTopBottom + 'px 0');
                }
            }

		};

		return imageUploadThumb;
	}]);

});