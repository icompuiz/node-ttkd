var modelName = 'InputFormat';

var $mongoose = require('mongoose'),
    $restful = require('node-restful');

var model = $mongoose.model(modelName);

var resource = $restful
    .model(modelName, model.schema)
    .methods(['get', 'post', 'put', 'delete']);


function register() {
    return resource;
}

module.exports = {
    resource: resource,
    register: register
};
