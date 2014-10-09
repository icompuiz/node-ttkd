'use strict';

var modelName = 'Student';

var mongoose = require('mongoose'),
    restful = require('node-restful');

var model = mongoose.model(modelName);

var resource = restful
    .model(modelName, model.schema)
    .methods(['get', 'post', 'put', 'delete']);

function addStudentToClass(req, res, next) {
    if (req.body.class) {
        var Class = mongoose.model('Class');

        Class.findByIdAndUpdate(req.body.class, {
            $addToSet: {
                students: res.locals.bundle._id
            }
        }, function(err) {

            if (err) {
                console.log('controller::student::addStudentToClass::error', err);
                return next(err);
            }

            return next();

        });

    } else {
        next();
    }
}


function register() {
    // put any middleware here

    resource.after('post', addStudentToClass);
    resource.after('put', addStudentToClass);

    return resource;
}

module.exports = {
    resource: resource,
    register: register
};
