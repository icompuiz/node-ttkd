define(['./module'], function (directives) {
  'use strict';

  return directives.directive('sigpad', ['$log', function($log) {
    var html = '<div id="signature-pad" class="m-signature-pad">' +
    '<div class="m-signature-pad--body">' +
    '  <canvas class="sigpad"></canvas>' +
    '</div>' +
    '</div>';

    var sigPadDirective = {
      restrict: 'E',
      replace: true,
      transclude: false,
      scope: {data: '='},
      compile: function (element, attrs) {

        return function (scope, element, attrs, controller) {
          $log.log('Attaching sigpad canvas to dom');
          var newElem = $(html);
          element.replaceWith(newElem);

          var canvas = document.querySelector('canvas');
          var signaturePad = new SignaturePad(canvas);

          function resizeCanvas() {
              var ratio =  window.devicePixelRatio || 1;
              canvas.width = canvas.offsetWidth * ratio;
              canvas.height = canvas.offsetHeight * ratio;
              canvas.getContext('2d').scale(ratio, ratio);
          }

          window.onresize = resizeCanvas;
          resizeCanvas();

          var wrapper = document.getElementById('signature-pad');
          var clearButton = document.querySelector('[data-action=clearsigpad]');
          var saveButton = document.querySelector('[data-action=savesigpad]');

          scope.data = {};

          clearButton.addEventListener('click', function () {
              signaturePad.clear();
          });

          saveButton.addEventListener('click', function () {
              if (signaturePad.isEmpty()) {
                  scope.data.errors = 'Please sign the above agreement.';
              } else {
                  scope.data.errors = null;
                  scope.data.data = signaturePad.toDataURL();
              }
          });

         };
      }
    };

    return sigPadDirective;

  }]);
});