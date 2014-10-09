define(['./module'], function (directives) {
  'use strict';

  return directives.directive('colorpicker', ['$document', '$compile', 'Color', 'Slider', 'Helper', function ($document, $compile, Color, Slider, Helper) {
        var colorPickerDirective = {
          require: '?ngModel',
          restrict: 'A',
          link: function ($scope, elem, attrs, ngModel) {
            var
                thisFormat = attrs.colorpicker ? attrs.colorpicker : 'hex',
                position = angular.isDefined(attrs.colorpickerPosition) ? attrs.colorpickerPosition : 'bottom',
                fixedPosition = angular.isDefined(attrs.colorpickerFixedPosition) ? attrs.colorpickerFixedPosition : false,
                target = angular.isDefined(attrs.colorpickerParent) ? elem.parent() : angular.element(document.body),
                withInput = angular.isDefined(attrs.colorpickerWithInput) ? attrs.colorpickerWithInput : false,
                inputTemplate = withInput ? '<input type="text" name="colorpicker-input">' : '',
                template =
                    '<div class="colorpicker dropdown">' +
                        '<div class="dropdown-menu">' +
                        '<colorpicker-saturation><i></i></colorpicker-saturation>' +
                        '<colorpicker-hue><i></i></colorpicker-hue>' +
                        '<colorpicker-alpha><i></i></colorpicker-alpha>' +
                        '<colorpicker-preview></colorpicker-preview>' +
                        inputTemplate +
                        '<button class="close close-colorpicker">&times;</button>' +
                        '<button class="none-colorpicker" ng-click="clearColor()">None</button>' +
                        '</div>' +
                        '</div>',
                colorpickerTemplate = angular.element(template),
                pickerColor = Color,
                sliderAlpha,
                sliderHue = colorpickerTemplate.find('colorpicker-hue'),
                sliderSaturation = colorpickerTemplate.find('colorpicker-saturation'),
                colorpickerPreview = colorpickerTemplate.find('colorpicker-preview'),
                pickerColorPointers = colorpickerTemplate.find('i');

            $compile(colorpickerTemplate)($scope);

            if (withInput) {
              var pickerColorInput = colorpickerTemplate.find('input');
              pickerColorInput
                  .on('mousedown', function(event) {
                    event.stopPropagation();
                  })
                  .on('keyup', function(event) {
                    var newColor = this.value;
                    elem.val(newColor);
                    if(ngModel) {
                      $scope.$apply(ngModel.$setViewValue(newColor));
                    }
                    event.stopPropagation();
                    event.preventDefault();
                  });
              elem.on('keyup', function() {
                pickerColorInput.val(elem.val());
              });
            }

            var bindMouseEvents = function() {
              $document.on('mousemove', mousemove);
              $document.on('mouseup', mouseup);
            };

            if (thisFormat === 'rgba') {
              colorpickerTemplate.addClass('alpha');
              sliderAlpha = colorpickerTemplate.find('colorpicker-alpha');
              sliderAlpha
                  .on('click', function(event) {
                    Slider.setAlpha(event, fixedPosition);
                    mousemove(event);
                  })
                  .on('mousedown', function(event) {
                    Slider.setAlpha(event, fixedPosition);
                    bindMouseEvents();
                  });
            }

            sliderHue
                .on('click', function(event) {
                  Slider.setHue(event, fixedPosition);
                  mousemove(event);
                })
                .on('mousedown', function(event) {
                  Slider.setHue(event, fixedPosition);
                  bindMouseEvents();
                });

            sliderSaturation
                .on('click', function(event) {
                  Slider.setSaturation(event, fixedPosition);
                  mousemove(event);
                })
                .on('mousedown', function(event) {
                  Slider.setSaturation(event, fixedPosition);
                  bindMouseEvents();
                });

            if (fixedPosition) {
              colorpickerTemplate.addClass('colorpicker-fixed-position');
            }

            colorpickerTemplate.addClass('colorpicker-position-' + position);

            target.append(colorpickerTemplate);

            if(ngModel) {
              ngModel.$render = function () {
                elem.val(ngModel.$viewValue);
              };
              $scope.$watch(attrs.ngModel, function() {
                update();
              });
            }

            elem.on('$destroy', function() {
              colorpickerTemplate.remove();
            });

            var previewColor = function () {
              try {
                colorpickerPreview.css('backgroundColor', pickerColor[thisFormat]());
              } catch (e) {
                colorpickerPreview.css('backgroundColor', pickerColor.toHex());
              }
              sliderSaturation.css('backgroundColor', pickerColor.toHex(pickerColor.value.h, 1, 1, 1));
              if (thisFormat === 'rgba') {
                sliderAlpha.css.backgroundColor = pickerColor.toHex();
              }
            };

            var mousemove = function (event) {
              var
                  left = Slider.getLeftPosition(event),
                  top = Slider.getTopPosition(event),
                  slider = Slider.getSlider();

              Slider.setKnob(top, left);

              if (slider.callLeft) {
                pickerColor[slider.callLeft].call(pickerColor, left / 100);
              }
              if (slider.callTop) {
                pickerColor[slider.callTop].call(pickerColor, top / 100);
              }
              previewColor();
              var newColor = pickerColor[thisFormat]();
              elem.val(newColor);
              if(ngModel) {
                $scope.$apply(ngModel.$setViewValue(newColor));
              }
              if (withInput) {
                pickerColorInput.val(newColor);
              }
              return false;
            };

            var mouseup = function () {
              $document.off('mousemove', mousemove);
              $document.off('mouseup', mouseup);
            };

            var update = function () {
              pickerColor.setColor(elem.val());
              pickerColorPointers.eq(0).css({
                left: pickerColor.value.s * 100 + 'px',
                top: 100 - pickerColor.value.b * 100 + 'px'
              });
              pickerColorPointers.eq(1).css('top', 100 * (1 - pickerColor.value.h) + 'px');
              pickerColorPointers.eq(2).css('top', 100 * (1 - pickerColor.value.a) + 'px');
              previewColor();
            };

            var getColorpickerTemplatePosition = function() {
              var
                  positionValue,
                  positionOffset = Helper.getOffset(elem[0]);

              if(angular.isDefined(attrs.colorpickerParent)) {
                positionOffset.left = 0;
                positionOffset.top = 0;
              }

              if (position === 'top') {
                positionValue =  {
                  'top': positionOffset.top - 147,
                  'left': positionOffset.left
                };
              } else if (position === 'right') {
                positionValue = {
                  'top': positionOffset.top,
                  'left': positionOffset.left + 126
                };
              } else if (position === 'bottom') {
                positionValue = {
                  'top': positionOffset.top + elem[0].offsetHeight + 2,
                  'left': positionOffset.left
                };
              } else if (position === 'left') {
                positionValue = {
                  'top': positionOffset.top,
                  'left': positionOffset.left - 150
                };
              }
              return {
                'top': positionValue.top + 'px',
                'left': positionValue.left + 'px'
              };
            };

            var documentMousedownHandler = function() {
              hideColorpickerTemplate();
            };

            elem.on('click', function () {
              update();
              colorpickerTemplate
                  .addClass('colorpicker-visible')
                  .css(getColorpickerTemplatePosition());

              // register global mousedown event to hide the colorpicker
              $document.on('mousedown', documentMousedownHandler);
            });

            colorpickerTemplate.on('mousedown', function (event) {
              event.stopPropagation();
              event.preventDefault();
            });

            var emitEvent = function(name) {
              if(ngModel) {
                $scope.$emit(name, {
                  name: attrs.ngModel,
                  value: ngModel.$modelValue
                });
              }
            };

            var hideColorpickerTemplate = function() {
              if (colorpickerTemplate.hasClass('colorpicker-visible')) {
                colorpickerTemplate.removeClass('colorpicker-visible');
                emitEvent('colorpicker-closed');
                // unregister the global mousedown event
                $document.off('mousedown', documentMousedownHandler);
              }
            };

            colorpickerTemplate.find('button').on('click', function () {
              hideColorpickerTemplate();
            });
          }
        };

        return colorPickerDirective;
      }]);
});