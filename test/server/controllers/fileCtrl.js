'use strict';

var request = require('supertest'),
    fs = require('fs'),
    _ = require('lodash'),
    assert = require('assert'),
    buffertools = require('buffertools'),
    toastyCMS = require('../../../server/server');


var randomString = function random(length) {
    // body...
    length = length || 5;
    return Math.random().toString(36).substring(7).substring(0, length);
};

describe('FileSystem', function() {

    var app;

    before(function(done) {

        if (toastyCMS.app) {
            app = toastyCMS.app;
            return done();
        }

        toastyCMS.run(function(server) {

            app = server;
            // mongoose = require('mongoose');

            done();

        }, {
            useDb: 'test',
            mode: 'test',
            // initialize: true
        });

    });

    describe('Directory API with Files', function() {

        var directory = {
            name: randomString()
        };

        var subdirectory = {
            name: randomString()
        };

        var file;

        it('should respond with the new directory', function(done) {

            request(app)
                .post('/api/fs/directories')
                .send(directory)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (!res.body._id) {
                        return 'no id present';
                    }

                    directory._id = res.body._id;
                })
                .expect(function(res) {
                    if (res.body.name !== directory.name) {
                        return 'directory name doesn\'t match';
                    }

                })
                .expect(201, done);

        });

        it('should not have an acl property', function(done) {

            request(app)
                .get('/api/fs/directories/' + directory._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (res.body.acl) {
                        return 'acl field visible';
                    }
                })
                .expect(200, done);

        });


        it('should upload a file', function(done) {


            request(app)
                .post('/api/fs/directories/' + directory._id + '/files')
                .attach('file', 'test/server/fixtures/image.png')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (!res.body._id) {
                        return 'no id present';
                    }

                    file = res.body;
                })
                .expect(function(res) {
                    if (res.body.acl) {
                        return 'acl field visible';
                    }
                })
                .expect(function(res) {
                    if (res.body.name !== 'image.png') {
                        return 'file name doesn\'t match';
                    }

                })
                .expect(200, done);

        });

        it('file should be in the directory', function(done) {

            request(app)
                .get('/api/fs/files/' + file._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (file.directory !== directory._id) {
                        return 'The file does not reference the directory'
                    }
                })
                .expect(200, done);

        });

        it('file should be in the directory items list', function(done) {

            request(app)
                .get('/api/fs/directories/' + directory._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (_.indexOf(res.body.files, file._id) === -1) {
                        return 'The directories does not reference the file';
                    }
                })
                .expect(200, done);

        });

        it('should be the same file', function(done) {

            function binaryParser(res, callback) {
                res.setEncoding('binary');
                res.data = '';
                res.on('data', function(chunk) {
                    res.data += chunk;
                });
                res.on('end', function() {
                    callback(null, new Buffer(res.data, 'binary'));
                });
            }

            request(app)
                .get('/api/fs/files/' + file._id + '/download')
                .expect('Content-Type', 'image/png')
                .parse(binaryParser)
                .end(function(err, res) {
                    if (err) return done(err);

                    fs.readFile('test/server/fixtures/image.png', function(err, data) {

                        var match = buffertools.equals(data, res.body);

                        assert.ok(match, 'Files don\'t match');

                        done();

                    });

                });

        });

        it('should delete the file', function(done) {

            request(app)
                .delete('/api/fs/files/' + file._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should have deleted the file', function(done) {

            request(app)
                .get('/api/fs/files/' + file._id)
            // .set('Accept', 'application/json')
            .expect('Content-Type', /html/)
                .expect(404, done);

        });

        it('file should no longer be in the directory items list', function(done) {

            request(app)
                .get('/api/fs/directories/' + directory._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    console.log('----------------------')
                    console.log('Look', res.body.files);
                    console.log('----------------------')
                    if (_.indexOf(res.body.files, file._id) !== -1) {
                        return 'The directory still references the file';
                    }
                })
                .expect(200, done);

        });

        //-----------------------------------------------------

        it('should create a subdirectory', function(done) {

            subdirectory.directory = directory._id;

            request(app)
                .post('/api/fs/directories')
                .send(subdirectory)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (!res.body._id) {
                        return 'no id present';
                    }

                    subdirectory = res.body;

                })
                .expect(function(res) {
                    if (res.body.name !== subdirectory.name) {
                        return 'subdirectory name doesn\'t match';
                    }

                })
                .expect(201, done);

        });

        it('subdirectory should be in the directory', function(done) {

            request(app)
                .get('/api/fs/directories/' + subdirectory._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (res.body.directory !== directory._id) {
                        return 'The directory does not reference the directory'
                    }
                })
                .expect(200, done);

        });

        it('subdirectory should be in the directory items list', function(done) {

            request(app)
                .get('/api/fs/directories/' + directory._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (_.indexOf(res.body.files, subdirectory._id) === -1) {
                        return 'The directory does not reference the directory';
                    }
                })
                .expect(200, done);

        });

        it('should delete the subdirectory', function(done) {

            request(app)
                .delete('/api/fs/directories/' + subdirectory._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should have deleted the subdirectory', function(done) {

            request(app)
                .get('/api/fs/directories/' + subdirectory._id)
            // .set('Accept', 'application/json')
            .expect('Content-Type', /html/)
                .expect(404, done);

        });

        it('subdirectory should no longer be in the directory items list', function(done) {

            request(app)
                .get('/api/fs/directories/' + directory._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (_.indexOf(res.body.files, subdirectory._id) !== -1) {
                        return 'The directory still references the directory';
                    }
                })
                .expect(200, done);

        });

        //-----------------------------------------------------

        it('should delete the directory', function(done) {

            request(app)
                .delete('/api/fs/directories/' + directory._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should have deleted the directory', function(done) {
            request(app)
                .get('/api/fs/directories/' + directory._id)
            // .set('Accept', 'application/json')
            .expect('Content-Type', /html/)
                .expect(404, done);

        });



    });
});
