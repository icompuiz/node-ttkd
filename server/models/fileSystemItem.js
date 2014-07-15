var $mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    Model = require('./_model');

var FileSystemItemSchema = Model.schema.extend({
    name: {
        type: String,
        default: '',
        trim: true,
        required: true
    },
    directory: {
        type: $mongoose.Schema.Types.ObjectId,
        ref: 'Directory'
    }
}, {
    collection: 'filesystemitems'
});

FileSystemItemSchema.pre('save', function(done) {
    var fsItem = this;

    var conditions = {
        name: fsItem.name
    };

    if (fsItem.directory) {
        conditions.directory = fsItem.directory;
    }

    var FileSystemItem = $mongoose.model('FileSystemItem');
    FileSystemItem
        .count(conditions).exec(
            function(err, count) {
                console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::enter');
                if (err) {
                    console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::error', (err.message || err));
                    return done(err);
                }

                if (count > 0) {
                    err = new Error('A file system item with this name already exists');
                    console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::err', err.message);
                    return done(err);
                }

                console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::success');
                done();
            });
});

FileSystemItemSchema.pre('save', function(done) {
    var fsItem = this;
    var Directory = $mongoose.model('Directory');

    if (!fsItem.directory) {
        return done();
    }

    Directory
        .findOneAndUpdate({
                _id: fsItem.directory
            }, {
                $push: {
                    files: fsItem._id
                }
            }, {
                safe: true
            },
            function(err, directory) {
                console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::enter');
                if (err) {
                    console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::error', err);
                    return done(err);
                }

                if (!directory) {
                    err = new Error('Specified directory not found');
                    console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::error', err);
                    return done(err); // TODO: need to do clean up
                }

                console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::success');
                done();
            });
});

FileSystemItemSchema.post('remove', function(fsItem) {

    if (!fsItem.directory) {
        return;
    }

    var Directory = $mongoose.model('Directory');
    Directory
        .findOneAndUpdate({
                _id: fsItem.directory
            }, {
                $pull: {
                    files: fsItem._id
                }
            }, {
                safe: true
            },
            function(err, directory) {
                console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::enter');
                if (err) {
                    console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::error', err);
                    // return done(err);
                    return;
                }

                if (!directory) {
                    err = new Error('Specified directory not found');
                    console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::error', err);
                    // return done(err); // TODO: need to do clean up
                    return;
                }

                console.log('model::filesystemitem::handleFileUpload::findOneAndUpdate::success');
                // done();
            });
});

var FileSystemItem = $mongoose.model('FileSystemItem', FileSystemItemSchema);
module.exports = FileSystemItem;
