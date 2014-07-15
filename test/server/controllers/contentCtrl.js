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


describe('Content', function() {

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

    describe('GET /api/contentitems', function() {

        var content = {
            name: randomString()
        };

        var childContent = {
            name: randomString()
        };

        it('should respond with json', function(done) {


            request(app)
                .post('/api/contentitems')
                .send(content)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (res.body.name !== content.name) {
                        return 'content name doesn\'t match';
                    }

                })
                .expect(function(res) {
                    if (!res.body._id) {
                        return 'no id present';
                    }

                    content = res.body;
                    childContent.parent = content._id;
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
                .get('/api/contentitems/' + content._id)
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

        it('should create childContent', function(done) {


            request(app)
                .post('/api/contentitems')
                .send(childContent)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (res.body.name !== childContent.name) {
                        return 'childContent name doesn\'t match';
                    }

                })
                .expect(function(res) {
                    if (!res.body._id) {
                        return 'no id present';
                    }

                    childContent = res.body;
                })
                .expect(function(res) {
                    if (res.body.acl) {
                        return 'acl field visible';
                    }
                })
                .expect(201, done);


        });

        it('childContent\'s parent should be content', function(done) {

            request(app)
                .get('/api/contentitems/' + childContent._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (res.body.acl) {
                        return 'acl field visible';
                    }
                })
                .expect(function(res) {
                    if (res.body.parent !== content._id) {
                        return 'parent field not set';
                    }
                })
                .expect(200, done);

        });

        it('childContent should be in the content children list', function(done) {

            request(app)
                .get('/api/contentitems/' + content._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (_.indexOf(res.body.children, childContent._id) === -1) {
                        return 'The children list does not reference the file';
                    }
                })
                .expect(200, done);

        });

        it('should delete the childContent', function(done) {

            request(app)
                .delete('/api/contentitems/' + childContent._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should have deleted the childContent', function(done) {
            request(app)
                .get('/api/fs/directories/' + childContent._id)
                .expect('Content-Type', /html/)
                .expect(404, done);     

        });

        it('childContent should not be in the content children list', function(done) {

            request(app)
                .get('/api/contentitems/' + content._id)
                .expect('Content-Type', /json/)
                .expect(function(res) {
                    if (_.indexOf(res.body.children, childContent._id) !== -1) {
                        return 'The children list references the file';
                    }
                })
                .expect(200, done);

        });

        //-----------------


        it('should delete the content', function(done) {

            request(app)
                .delete('/api/contentitems/' + content._id)
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200, done);
        });

        it('should have deleted the content', function(done) {
            request(app)
                .get('/api/fs/directories/' + content._id)
	            .expect('Content-Type', /html/)
	            .expect(404, done);		

        });

    });

});
