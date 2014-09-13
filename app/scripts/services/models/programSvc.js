/* globals define: true  */
define(['../module'], function (services) {
	'use strict';

	services.service('ProgramSvc', ['EndpointFactory','ModelFactory', function(EndpointFactory,ModelFactory) {

		// privates
		var ProgramModel = ModelFactory.create('programs');

		function startCreating() {
			ProgramModel.creating = true;
			ProgramModel.editing = false;
			ProgramModel.viewing = false;
		}

		function startEditing() {
			ProgramModel.editing = true;
			ProgramModel.creating = false;
			ProgramModel.viewing = false;
		}

		function startViewing() {
			ProgramModel.viewing = true;
			ProgramModel.editing = false;
			ProgramModel.creating = false;
		}

		ProgramModel.startViewing = startViewing;
		ProgramModel.startEditing = startEditing;
		ProgramModel.startCreating = startCreating;

		return ProgramModel;


	}]);

});