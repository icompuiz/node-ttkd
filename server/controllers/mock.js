var modelName = 'Mock';

var $mongoose = require('mongoose'),
    $restful = require('node-restful');

var model = $mongoose.model(modelName);

var resource = $restful
    .model(modelName, model.schema)
    .methods(['get', 'post', 'put', 'delete']);


function register() {
    var accessControlListsController = require('../plugins/accessControlListsController');
    accessControlListsController.plugin(resource, model);

    resource.before('get', function(req, res, next) {
        var id = req.params.id;

        if (id) {
            model.findOne({
                _id: id
            }).exec(function(err, mock) {

                if (mock) {

                    mock.isAllowed('read', function(err, isAllowed) {

                        if (isAllowed) {
                            return next();
                        }

                        return res.json(401, 'Forbidden');

                    });
                } else {

                    return res.json(404, 'Not found');
                }

            });
        }

        next();

    });

    return resource;
    

}

module.exports = {
    resource: resource,
    register: register
};
