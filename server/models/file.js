'use strict';

require('mongoose-schema-extend');
var $mongoose = require('mongoose'),
    GridStore = $mongoose.mongo.GridStore,
    ObjectId = $mongoose.mongo.BSONPure.ObjectID,
    $filesystem = require('fs'),
    Schema = $mongoose.Schema;
    // _ = require('lodash'),
    // $async = require('async'),
var FileSystemItem = require('./fileSystemItem');

var prefix = 'fs';
// var filesCollection = prefix + '.files';

var FileSchema = FileSystemItem.schema.extend({
    fileId: {
        type: Schema.Types.ObjectId
    }
});

var copyFile = function(file, doneCopyingFile) {
    function onFileExists(exists) {
        if (exists) {

            var options = {
                root: prefix,
                // metadata: file.metadata,
                'content_type': file.type
            };

            var gridStore = GridStore($mongoose.connection.db, new ObjectId(), file.name, 'w', options);
            gridStore.writeFile(file.path, function(err, storedFile) {
                if (err) {
                    console.log('model::file::copyFile::gsWriteFile::error');
                    return doneCopyingFile(err);
                }
                console.log('model::file::copyFile::gsWriteFile::success');
                doneCopyingFile(null, storedFile);
            });

        }
    }
    $filesystem.exists(file.path, onFileExists);
};

var download = function(fileId, sendStream) {

    function onFileOpen(err, fileStream) {
        if (err) {

            console.log('model::file::download::statics::onFileOpen::err');
            return sendStream(err);
        }

        console.log('model::file::download::statics::onFileOpen::success', 'sending stream');

        return sendStream(null, fileStream);
    }

    console.log('model::file::download::statics::onFileStreamReady::enter', fileId);


    var gridStore = GridStore($mongoose.connection.db, fileId, 'r', {
        root: prefix
    });

    gridStore.open(onFileOpen);

};

var deleteFile = function(fileId, doneDeletingFile) {

    function doDelete(fileStream) {
        fileStream.unlink(function(err) {
            if (err) {
                return doneDeletingFile(err);
            }

            doneDeletingFile(null, fileStream);
        });
    }

    function onFileOpen(err, fileStream) {

        if (err) {
            doneDeletingFile(err);
        }

        doDelete(fileStream);

    }

    var gridStore = GridStore($mongoose.connection.db, fileId, 'r', {
        root: prefix
    });

    gridStore.open(onFileOpen);

};

// Copys the file into fileId
FileSchema.statics.copyFile = copyFile;

FileSchema.statics.download = download;

FileSchema.statics.delete = deleteFile;

FileSchema.methods.download = function(sendStream) {
    var file = this;

    function onFileStreamReady(err, fileStream) {
        if (err) {
            console.log('model::file::methods::download::onFileStreamReady::err', err);
            return sendStream(err);
        }

        console.log('model::file::methods::download::onFileStreamReady::enter', fileStream.fileId, fileStream.filename);
        sendStream(null, fileStream);
    }

    console.log('model::file::download::enter');
    download(file.fileId, onFileStreamReady);

};

FileSchema.methods.copyFile = function(tmpData, doneCopyingFile) {

    // var file = this;

    function onFileCopied(err, storedFile) {

        if (err) {
            return doneCopyingFile(err);
        }

        doneCopyingFile(null, storedFile);
    }

    copyFile(tmpData, onFileCopied);

};

FileSchema.pre('remove', function(done) {

    var file = this;
    if (file.fileId) {
        return deleteFile(file.fileId, done);
    }
    done();

});


var File = $mongoose.model('File', FileSchema);
module.exports = File;
