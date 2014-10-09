define(['./module'], function (factories) {
  'use strict';

  factories.factory('Helper', [function() {

	  return {

		closestSlider: function (elem) {
		  var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;
		  if (matchesSelector.bind(elem)('I')) {
			return elem.parentNode;
		  }
		  return elem;
		},
		getOffset: function (elem, fixedPosition) {
		  var
			  x = 0,
			  y = 0,
			  scrollX = 0,
			  scrollY = 0;
		  while (elem && !isNaN(elem.offsetLeft) && !isNaN(elem.offsetTop)) {
			x += elem.offsetLeft;
			y += elem.offsetTop;
			if (!fixedPosition && elem.tagName === 'BODY') {
			  scrollX += document.documentElement.scrollLeft || elem.scrollLeft;
			  scrollY += document.documentElement.scrollTop || elem.scrollTop;
			} else {
			  scrollX += elem.scrollLeft;
			  scrollY += elem.scrollTop;
			}
			elem = elem.offsetParent;
		  }
		  return {
			top: y,
			left: x,
			scrollX: scrollX,
			scrollY: scrollY
		  };
		},
		// a set of RE's that can match strings and generate color tuples. https://github.com/jquery/jquery-color/
		stringParsers: [
		  {
			re: /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
			parse: function (execResult) {
			  return [
				execResult[1],
				execResult[2],
				execResult[3],
				execResult[4]
			  ];
			}
		  },
		  {
			re: /rgba?\(\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*,\s*(\d+(?:\.\d+)?)\%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/,
			parse: function (execResult) {
			  return [
				2.55 * execResult[1],
				2.55 * execResult[2],
				2.55 * execResult[3],
				execResult[4]
			  ];
			}
		  },
		  {
			re: /#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})/,
			parse: function (execResult) {
			  return [
				parseInt(execResult[1], 16),
				parseInt(execResult[2], 16),
				parseInt(execResult[3], 16)
			  ];
			}
		  },
		  {
			re: /#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])/,
			parse: function (execResult) {
			  return [
				parseInt(execResult[1] + execResult[1], 16),
				parseInt(execResult[2] + execResult[2], 16),
				parseInt(execResult[3] + execResult[3], 16)
			  ];
			}
		  }
		]
	  };
	}]);
  });
