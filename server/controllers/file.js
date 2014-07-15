var $mongoose = require('mongoose'),
    $restful = require('node-restful'),
    $path = require('path'),
    _ = require('lodash');

var File = $mongoose.model('File'),
    Directory = $mongoose.model('Directory'),
    AccessControlList = $mongoose.model('AccessControlList');

var resource = $restful
    .model('File', File.schema)
    .methods(['get', 'put', 'delete']);



var handleFileUpload = function(req, res, next) {
    console.log('controller::file::handleFileUpload::enter')

    var keys = Object.keys(req.files);

    if (keys.length > 0) {


        var directoryId = req.body.directory;

        if (!directoryId) {
            return res.send(500, 'Please specify a directory');
        }

        var firstKey = keys[0];
        var tmpFile = req.files[firstKey];

        var copyData = {
            path: tmpFile.path,
            name: tmpFile.name,
            type: tmpFile.type,
            size: tmpFile.size
        };

        var fileData = {
            name: tmpFile.name,
            directory: directoryId
        };

        var file = new File(fileData);


        console.log('controller::file::handleFileUpload::update::before', fileData.name);

        function saveFile() {

            function done(err) {

                if (err) {
                    console.log('controller::file::handleFileUpload::findOneAndUpdate::saveFile::done::err')
                    return res.send(500, err.message);
                }
                console.log('controller::file::handleFileUpload::findOneAndUpdate::saveFile::done::success')

                file.acl = null;

                return res.json(200, file);
            }

            file.save(done);

        }

        function onFileCopied(err, storedFile) {

            console.log('controller::file::handleFileUpload::onFileCopied::enter');

            if (err) {
                console.log('controller::file::handleFileUpload::onFileCopied::error', err);
                return res.json(500, err);
            }

            file.fileId = storedFile.fileId;

            console.log('controller::file::handleFileUpload::onFileCopied::success::stored file', storedFile.fileId);
            console.log('controller::file::handleFileUpload::onFileCopied::success::current file', file.fileId);

            saveFile();

        }

        Directory.findById(directoryId).exec(function(err, directory) {

            if (err) {
                console.log('controller::file::handleFileUpload::findOneAndUpdate::error', err);
                return res.json(400, err.message || err);
            }

            if (!directory) {
                err = new Error('Specified directory not found');
                console.log('controller::file::handleFileUpload::findOneAndUpdate::error', err);
                return res.json(404, err.message || err); // TODO: need to do clean up
            }

            file.copyFile(copyData, onFileCopied);

        });

    }
};

// Access Control: read 
var handleFileDownload = function(req, res, next) {

    console.log('controller::file::handleFileDownload::enter');

    var fileId = req.params.id;


    File.findById(fileId).exec(function(err, file) {
        if (err) {
            return res.send(400, err.message || err);
        }

        if (!file) {
            return res.send(404, 'File not found');

        }


        file.download(function(err, fileStream) {

            if (err) {

                console.log('controller::file::handleFileDownload::findById::download::error', err);

                return res.send(500, err.message);

            }

            console.log('controller::file::handleFileDownload::findById::download::sucess', 'Sending stream');

            var type = fileStream.contentType;
            res.header('Content-Type', type);
            res.header("Content-Disposition", "attachment; filename=" + $path.basename(fileStream.filename));
            fileStream.stream(true).pipe(res);
        });

    });



};


// when you upload to a valid file, you can modify the gridfs ref
// resource.route('upload.post', {
// 	detail: true,
// 	handler: handleFileUpload
// });

function register() {

    var accessControlListsController = require('../plugins/accessControlListsController');
    accessControlListsController.plugin(resource, File);

    // Access Control: read 
    resource.route('download.get', {
        detail: true,
        handler: handleFileDownload
    });

    // Access Control: remove 
    resource.before('delete', function(req, res, next) {

        File.findById(req.params.id).exec(function(err, file) {

            if (err) {
                console.log('controller::file::before::delete::findById::err', err);
                return res.send(500, err.message || err);
            }

            if (!file) {
                err = new Error('File not found');
                console.log('controller::file::before::delete::findById::err', err);
                return res.send(404, err.message || err);
            }

            file.remove(function(err) {
                if (err) {
                    console.log('controller::file::before::delete::remove::err');
                    return res.send(500, err.message || err);
                }
                console.log('controller::file::before::delete::findById::remove::success');

                res.json(200, file);
            });

        });


    });

    return resource;

}

module.exports = {
    handleFileUpload: handleFileUpload,
    handleFileDownload: handleFileDownload,
    resource: resource,
    register: register
}
