 /* globals _: true, define: true */

define(['./module'], function (factories) {
	'use strict';

	factories.factory('WizardFactory', [function() {

		function WizardStep(config) {

			var _this = this;

			_this.id = null;
			_this.title = null;
			_this.enabled = false;
			_this.isFinalStep = false;

			_.assign(this, config);

		}

		function Wizard(steps) {

			var _this = this;

			_this.steps = steps.map(function(config) {
				return new WizardStep(config);
			});

			_this.cursor = 0;
			_this.totalSteps = _this.steps.length;


			function peekNextIndex() {
				var index = (_this.cursor + 1);
				if (index < _this.totalSteps) {
					return index;
				} else {
					return false;
				}
			}

			function peekPreviousIndex() {
				var index = _this.cursor - 1;
				if (index >= 0) {
					return index;
				} else {
					return false;
				}
			}

			function peekNextStep() {
				var index = peekNextIndex();
				if (index) {
					var step = getStep(index);
					return step;
				} else {
					return false;
				}
			}

			function peekPreviousStep() {
				var index = peekPreviousIndex();
				if (index) {
					var step = getStep(index);
					return step;
				} else {
					return false;
				}
			}

			function getCurrentStep() {
				var step = getStep(_this.cursor);
				_this.current = step;
				step.enabled = true;
				return step;
			}

			function getStep(index) {
				return _this.steps[index];
			}

			function findStep(stepId) {
				return _.find(_this.steps, {id: stepId});
			}

			function goBack() {
				_this.cursor = peekPreviousIndex();

				if (!_this.cursor) {
					_this.cursor = 0;
				}

				return getCurrentStep();
			}

			function goFoward() {
				_this.cursor = peekNextIndex();

				if (!_this.cursor) {
					return end();
				}

				return getCurrentStep();
			}

			function goTo(step) {
				// get the index of the step
				var index = _.indexOf(_this.steps, step);
				_this.cursor = index;
				return getCurrentStep();
			}

			function reset() {
				_this.cursor = 0;
				
				_this.steps.forEach(function(step) {
					step.enabled = false;
				});

				return getCurrentStep();
			}

			function end() {
				_this.cursor = _this.totalSteps - 1;
				return getCurrentStep();
			}

			_this.peekNextIndex = peekNextIndex;
			_this.peekPreviousIndex = peekPreviousIndex;
			_this.peekNextStep = peekNextStep;
			_this.peekPreviousStep = peekPreviousStep;
			_this.getCurrentStep = getCurrentStep;
			_this.getStep = getStep;
			_this.goBack = goBack;
			_this.goFoward = goFoward;
			_this.findStep = findStep;
			_this.reset = reset;
			_this.end = end;
			_this.goTo = goTo;


			_this.decorateScope = function decorateScope($scope) {

				$scope.peekNextIndex = peekNextIndex;
				$scope.peekPreviousIndex = peekPreviousIndex;
				$scope.peekNextStep = peekNextStep;
				$scope.peekPreviousStep = peekPreviousStep;
				$scope.getCurrentStep = getCurrentStep;
				$scope.getStep = getStep;
				$scope.goBack = goBack;
				$scope.goFoward = goFoward;
				$scope.findStep = findStep;
				$scope.reset = reset;
				$scope.end = end;
				$scope.goTo = goTo;

			};

			getCurrentStep();

		}

		return {
			create: function create(steps) {
				return new Wizard(steps);
			}
		};

	}]);

});