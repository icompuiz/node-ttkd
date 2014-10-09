'use strict';

var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server'),
    should = require('should'),
    fuzzer = require('fuzzer'),
    otFuzzer = require('ot-fuzzer'),
    EmergencyContact = require('../../../server/models/emergencyContact');

    describe('emergencycontacts', function() {
        var app;

        before(function(beforeDone) {

            if (server.app) {
                app = server.app;
                fuzzer.seed(0);
                return beforeDone();
            }

            server.run(function(server) {

                app = server;
                beforeDone();

            }, {
                useDb: 'test',
                mode: 'test',
                initialize: true
            });

        });

        var cookie = null;

        

        describe('login to application', function(loginToApplicationDone) {
            it('should login successfully', function(shouldLoginSuccessfullyDone) {
                request(app)
                    .post('/login')
                    .send({
                        username: 'administrator',
                        password: 'password'
                    })
                    .expect(function(res) {
                        console.log(res.headers['set-cookie']);
                        cookie = res.headers['set-cookie'];
                    })
                    .expect(200, shouldLoginSuccessfullyDone);
            });

        });
    
        var emergencycontact;
        describe('Post Data', function(postDone){
            it('should post emergencycontact', function(emergencycontactPostDone){
                    request(app)
                    .post('/api/emergencycontacts')
                    .send({
                        name: otFuzzer.randomWord(),
                        email: otFuzzer.randomWord(),
                        phoneNumber: otFuzzer.randomWord(),
                        relationship: otFuzzer.randomWord()
                    })
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res){
                        emergencycontact = res.body;
                    })
                    .expect(201,emergencycontactPostDone)
                });
        });

        describe('CRUD emergencycontacts', function() {

            describe('Create a emergencycontact', function() {

                it('should have a valid name', function(nameDone) {
                    request(app)
                        request(app)
                        .get('/api/emergencycontacts/'+emergencycontact._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body.name.should.be.type('string');
                            res.body.name.should.match(/[a-zA-Z0-9]/);
                            res.body.name.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                            res.body.name.length.should.not.be.below(2);
                            res.body.name.length.should.not.be.above(64);
                            res.body.name.should.match(emergencycontact.name);
                        })
                        .expect(200, nameDone);
                });

                it('should have a valid email', function(emailDone) {
                    request(app)
                        request(app)
                        .get('/api/emergencycontacts/')
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            for(var e in res.body){
                                e.email.should.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
                            }
                        })
                        .expect(200, emailDone);
                });

                it('should have a valid relationship', function(relationshipDone) {
                    request(app)
                        request(app)
                        .get('/api/emergencycontacts/')
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            for(var e in res.body){
                                e.relationship.should.be.type('string');
                                e.relationship.should.match(/[a-zA-Z0-9]/);
                                e.relationship.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                                e.relationship.length.should.not.be.below(2);
                                e.relationship.length.should.not.be.above(64);
                                e.relationship.should.match(emergencycontact.relationship);
                            }
                        })
                        .expect(200, relationshipDone);
                });

                it('should have a valid phone', function(phoneDone) {
                    request(app)
                        request(app)
                        .get('/api/emergencycontacts/')
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            for(var e in res.body){
                                e.phoneNumber.should.match(/[0-9]{10}/);
                            }
                        })
                        .expect(200, phoneDone);
                });
            });

            describe('Read a emergencycontact from the database', function() {
                it('should be that url_id matches emergencycontacts_id', function(readDone) {
                    request(app)
                        .get('/api/emergencycontacts/'+emergencycontact._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body._id.should.match(emergencycontact._id); 
                        })
                        .expect(200, readDone);
                });
            });
            
            describe('Update an existing emergencycontact', function() {
                it('should change emergencycontacts name', function(nameChangeDone){
                    request(app)
                        .get('/api/emergencycontacts'+emergencycontact._id)
                        .put({
                            name: otFuzzer.randomWord()
                        })
                        .expect(function(res){
                            res.body.emergencycontactOrder.should.not.match(emergencycontact.emergencycontactOrder);
                        })
                        .expect(201,nameChangeDone);
                });
            });

            describe('List all emergencycontacts', function(listDone){
                    it('should be a list', function(shouldListDone) {
                        request(app)
                            .get('/api/emergencycontacts')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                (res.body instanceof Array).should.be.true;
                            })
                            .expect(200, shouldListDone);
                    });
                });

            describe('Delete an existing emergencycontact', function() {
                it('should be that url_id has no matching emergencycontact_id', function(deleteDone) {
                    request(app)
                        .delete('/api/emergencycontacts/'+emergencycontact._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            emergencycontact._id.should.not.match(res.body._id); 
                        })
                        .expect(200, deleteDone);
                    });
            });


        });
    });
