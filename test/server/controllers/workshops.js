var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server');

describe('Workshops', function() {
    var app;

    before(function(done) {

    	if (server.app) {
    		app = server.app;
    		return done();
    	}

        server.run(function(server) {
            app = server;
            done();

        }, {
        	useDb: 'test',
        	mode: 'test',
        	initialize: true
        });

    });
    
    describe('CRUD Workshops', function() {

        describe('Create a Workshop', function() {

            it('should respond with json', function(done) {

                request(app)
                    .get('/api/mocks')
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(function(res) {
                    	console.log(res.body);
                    })
                    .expect(200, done);


            });
        });
        
        describe('Read a workshop from the database', function() {});
        describe('Update an existing workshop', function() {});
        describe('Delete an existing workshop', function() {});


    });
});
