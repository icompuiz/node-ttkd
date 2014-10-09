var _ = require('lodash');
var async = require('async');

function AccessControlListsController(resource, model) {

    // console.log('ksdkslmdsmcscmsdcmslcmsdlcmksdclmsd');

    function removeAclProp(req, res, next) {


        var bundle = res.locals.bundle;

        if (_.isArray(bundle)) {

            bundle = _.map(bundle, function(value) {
                value.acl = null;
                return value;
            });


        } else {

            bundle.acl = null;

        }

        res.locals.bundle = bundle;

        next();

    }

    function handleAclFilter(req, res, next) {


        var bundle = res.locals.bundle;
        var right = 'read';

        if (_.isArray(bundle)) {

            async.filter(bundle, function(current, verify) {

                model.findById(current._id).exec(function(err, item) {

                    console.log('accessControlListsController::', model.modelName, '::handleAclFilter::', right, '::findById::enter');
                    if (err) {
                        console.log('accessControlListsController::', model.modelName, '::handleAclFilter::', right, '::findById::err', err);
                        return res.send(500, err.message);

                    }

                    if (!item) {
                        var err = new Error(model.modelName + ' not found');
                        console.log('accessControlListsController::', model.modelName, '::handleAclFilter::', right, '::findById::err', err);
                        return res.send(404, err.message);
                    }

                    item.isAllowed(right, function(err, isAllowed) {

                        if (err) {
                            console.log('accessControlListsController::', model.modelName, '::handleAclFilter::', right, '::isAllowed::err', err);
                            return verify(false);
                        }

                        verify(isAllowed);

                    });
                });

            }, function(results) {

                res.locals.bundle = results;

                next();


            });


        } else {

            next();

        }



    }

    var handlePermissionCheck = function handlePermissionCheck(right, req, res, onAllowed) {

        var id = req.params.id;
        console.log('accessControlListsController::', model.modelName, '::handlePermissionCheck::', right, '::enter');

        model.findById(id).exec(function(err, item) {

            console.log('accessControlListsController::', model.modelName, '::handlePermissionCheck::', right, '::findById::enter');
            if (err) {
                console.log('accessControlListsController::', model.modelName, '::handlePermissionCheck::', right, '::findById::err', err);
                return res.send(500, err.message);

            }

            if (!item) {
                var err = new Error(model.modelName + ' not found');
                console.log('accessControlListsController::', model.modelName, '::handlePermissionCheck::', right, '::findById::err', err);
                return res.send(404, err.message);
            }

            item.isAllowed(right, function(err, isAllowed) {

                if (err) {
                    console.log('accessControlListsController::', model.modelName, '::handlePermissionCheck::', right, '::isAllowed::err', err);
                    return res.send(500, err.message);
                }

                if (!isAllowed) {
                    return res.json(401, 'Forbidden');
                }

                onAllowed(item);

            });
        });

    }

    resource.before('delete', function(req, res, next) {
        var onAllowed = function onAllowed() {
            next();
        };

        handlePermissionCheck('remove', req, res, onAllowed);

    });

    // Access Control: update 
    resource.before('put', function(req, res, next) {

        var onAllowed = function() {
            next();
        };

        handlePermissionCheck('update', req, res, onAllowed);

    });

    // Access Control: read
    resource.before('get', function(req, res, next) {

        var onAllowed = function() {
            next();
        };

        if (!req.params.id) {
            return next();
        }


        handlePermissionCheck('read', req, res, onAllowed);

    });

    resource.after('get', removeAclProp);

    resource.after('post', removeAclProp);

    resource.after('put', removeAclProp);

    resource.after('delete', removeAclProp);

    resource.after('get', handleAclFilter);

    resource.after('post', handleAclFilter);

    resource.after('put', handleAclFilter);

    resource.after('delete', handleAclFilter);

}

module.exports = {
    plugin: AccessControlListsController
};
