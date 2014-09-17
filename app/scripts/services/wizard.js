/* globals define: true  */
define(['./module'], function (services) {
	'use strict';

	services.service('WizardService', ['WizardFactory', function WizardService(WizardFactory) {

		var _this = this;

		var stepRegistry = {};

		_this.activeWizards = {};

		_this.register = function registerWizardSteps(id, steps) {
			stepRegistry[id] = steps;
		};

		_this.create = function create(id, persist) {

			var steps = stepRegistry[id];

			if (!steps) {
				return false;
			}

			var wizard = WizardFactory.create(steps);

			if (persist) {
				_this.activeWizards[id] = wizard;
			}

			return wizard;

		};

		_this.get = function getWizard(id) {
			return _this.activeWizards[id];
		};

		_this.reset = function reset() {
			_this.currentWizard = null;
		};


	}]);

});