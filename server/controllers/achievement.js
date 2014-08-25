var modelName = 'Achievement';

var mongoose = require('mongoose'),
	restful = require('node-restful');

var model = mongoose.model(modelName);

var resource = restful
	.model(modelName, model.schema)
	.methods(['get', 'post', 'put', 'delete']);


function register(){
	// put any middleware here
	return resource;
}

module.exports = {
	resource: resource,
	register: register
};