define(['./module'], function (factories) {
  'use strict';

  factories.factory('Slider', ['Helper', function (Helper) {
        var
            slider = {
              maxLeft: 0,
              maxTop: 0,
              callLeft: null,
              callTop: null,
              knob: {
                top: 0,
                left: 0
              }
            },
            pointer = {};

        return {
          getSlider: function() {
            return slider;
          },
          getLeftPosition: function(event) {
            return Math.max(0, Math.min(slider.maxLeft, slider.left + ((event.pageX || pointer.left) - pointer.left)));
          },
          getTopPosition: function(event) {
            return Math.max(0, Math.min(slider.maxTop, slider.top + ((event.pageY || pointer.top) - pointer.top)));
          },
          setSlider: function (event, fixedPosition) {
            var
              target = Helper.closestSlider(event.target),
              targetOffset = Helper.getOffset(target, fixedPosition);
            slider.knob = target.children[0].style;
            slider.left = event.pageX - targetOffset.left - window.pageXOffset + targetOffset.scrollX;
            slider.top = event.pageY - targetOffset.top - window.pageYOffset + targetOffset.scrollY;

            pointer = {
              left: event.pageX,
              top: event.pageY
            };
          },
          setSaturation: function(event, fixedPosition) {
            slider = {
              maxLeft: 100,
              maxTop: 100,
              callLeft: 'setSaturation',
              callTop: 'setLightness'
            };
            this.setSlider(event, fixedPosition);
          },
          setHue: function(event, fixedPosition) {
            slider = {
              maxLeft: 0,
              maxTop: 100,
              callLeft: false,
              callTop: 'setHue'
            };
            this.setSlider(event, fixedPosition);
          },
          setAlpha: function(event, fixedPosition) {
            slider = {
              maxLeft: 0,
              maxTop: 100,
              callLeft: false,
              callTop: 'setAlpha'
            };
            this.setSlider(event, fixedPosition);
          },
          setKnob: function(top, left) {
            slider.knob.top = top + 'px';
            slider.knob.left = left + 'px';
          }
        };
      }]);
});