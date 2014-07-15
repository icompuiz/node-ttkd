var express = require('express'),
    request = require('supertest'),
    async = require('async'),
    _ = require('lodash'),
    assert = require('assert'),
    toastyCMS = require('../../../server/server');

var randomString = function random(length) {
    // body...
    length = length || 5;
    return Math.random().toString(36).substring(7).substring(0, length);
};


describe('Content Type', function() {

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
            mode: 'test'
        });

    });

    describe('GET /api/contenttypes', function() {

        var contentType = {
            name: randomString()
        };

        var subcontentType = {
            name: randomString()
        };

        it('should respond with json', function(done) {


            request(app)
                .post('/api/contenttypes')
                .send(contentType)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (!res.body._id) {
                        return 'no id present';
                    }

                    contentType = res.body;
                    subcontentType.parent = contentType._id;
                })
                .expect(function(res) {
                    if (res.body.name !== contentType.name) {
                        return 'contentType name doesn\'t match';
                    }

                })
                .expect(function(res) {
                    if (res.body.acl) {
                        return 'acl field visible';
                    }
                })
                .expect(201, done);


        });

        it('should not have an acl property', function(done) {

            request(app)
                .get('/api/contenttypes/' + contentType._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (res.body.acl) {
                        return 'acl field visible';
                    }
                })
                .expect(200, done);

        });

        //-----------------

        it('should create subcontentType', function(done) {


            request(app)
                .post('/api/contenttypes')
                .send(subcontentType)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (res.body.name !== subcontentType.name) {
                        return 'subcontentType name doesn\'t match';
                    }

                })
                .expect(function(res) {
                    if (!res.body._id) {
                        return 'no id present';
                    }

                    subcontentType = res.body;
                })
                .expect(function(res) {
                    if (res.body.acl) {
                        return 'acl field visible';
                    }
                })
                .expect(201, done);


        });

        it('subcontentType\'s parent should be contentType', function(done) {

            request(app)
                .get('/api/contenttypes/' + subcontentType._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (res.body.acl) {
                        return 'acl field visible';
                    }
                })
                .expect(function(res) {
                    if (res.body.parent !== contentType._id) {
                        return 'parent field not set';
                    }
                })
                .expect(200, done);

        });

        it('subcontentType should be in the content children list', function(done) {

            request(app)
                .get('/api/contenttypes/' + contentType._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (_.indexOf(res.body.children, subcontentType._id) === -1) {
                        return 'The children list does not reference the file';
                    }
                })
                .expect(200, done);

        });

        it('should delete the sub content type', function(done) {

            request(app)
                .delete('/api/contenttypes/' + subcontentType._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should have deleted the sub content type', function(done) {
            request(app)
                .get('/api/fs/directories/' + subcontentType._id)
                .expect('Content-Type', /html/)
                .expect(404, done);     

        });

        it('subcontentType should not be in the content children list', function(done) {

            request(app)
                .get('/api/contenttypes/' + contentType._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (_.indexOf(res.body.children, subcontentType._id) !== -1) {
                        return 'The children list references the file';
                    }
                })
                .expect(200, done);

        });

        //-----------------
        

        it('should delete the content type', function(done) {

            request(app)
                .delete('/api/contenttypes/' + contentType._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should have deleted the content type', function(done) {
            request(app)
                .get('/api/fs/directories/' + contentType._id)
	            .expect('Content-Type', /html/)
	            .expect(404, done);		

        });

    });

});
