'use strict';

var $mongoose = require('mongoose');
var $async = require('async');

var NestableModelPlugin = function(schema, modelName) {

    schema.add({
        parent: {
            ref: modelName,
            type: $mongoose.Schema.Types.ObjectId
        },
        children: [{
            ref: modelName,
            type: $mongoose.Schema.Types.ObjectId
        }]
    });



    schema.pre('save', function(done) {
        var doc = this;
        var Model = $mongoose.model(modelName);

        if (!doc.parent) {
            return done();
        }

        Model
            .findOneAndUpdate({
                    _id: doc.parent
                }, {
                    $push: {
                        children: doc._id
                    }
                }, {
                    safe: true
                },
                function(err, parent) {
                    console.log('plugin::nestableModel::pre::save::findOneAndUpdate::enter');
                    if (err) {
                        console.log('plugin::nestableModel::pre::save::findOneAndUpdate::error', err);
                        return done(err);
                    }

                    if (!parent) {
                        err = new Error('Specified parent not found');
                        console.log('plugin::nestableModel::pre::save::findOneAndUpdate::error', err);
                        return done(err); // TODO: need to do clean up
                    }

                    console.log('plugin::nestableModel::pre::save::findOneAndUpdate::success');
                    done();
                });
    });
    schema.pre('remove', function(preRemoveDone) {
        var doc = this;

        console.log('plugin::nestableModel::pre::remove::enter');
        var Model = $mongoose.model(modelName);

        var conditions = {
            parent: doc._id
        };

        Model.find(conditions).exec(function(err, chidren) {
            $async.each(chidren, function(child, removeNextItem) {

                child.remove(removeNextItem);

            }, preRemoveDone);
        });
    });
    schema.post('remove', function(doc) {

        if (!doc.parent) {
            return;
        }

        var Model = $mongoose.model(modelName);
        Model
            .findOneAndUpdate({
                    _id: doc.parent
                }, {
                    $pull: {
                        children: doc._id
                    }
                }, {
                    safe: true
                },
                function(err, parent) {

                    console.log('plugin::nestableModel::post::remove::findOneAndUpdate::enter');
                    if (err) {
                        console.log('plugin::nestableModel::post::remove::findOneAndUpdate::error', err);
                        // return done(err);
                        return;
                    }

                    if (!parent) {
                        err = new Error('Specified parent not found');
                        console.log('plugin::nestableModel::post::remove::findOneAndUpdate::error', err);
                        // return done(err); // TODO: need to do clean up
                        return;
                    }

                    console.log('plugin::nestableModel::post::remove::findOneAndUpdate::success');
                    // done();
                });
    });


};

module.exports = NestableModelPlugin;
