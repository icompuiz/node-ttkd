/* global describe: true */
'use strict';

var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server'),
    should = require('should'),
    fuzzer = require('fuzzer'),
    EmergencyContact = require('../../../server/models/emergencyContact'),
    Rank = require('../../../server/models/rank'),
    File = require('../../../server/models/file');

    describe('Student', function() {
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

        describe('Post Data', function(postDone){
            //remove in server/data/loadData remove students
            it('should post stuff', function(stuffDone){
                // var contactA = new EmergencyContact();
                // var contactB = new EmergencyContact();
                // var rankA = new Rank();
                // var rankB = new Rank();
                request(app)
                .post('/api/students')
                .send({
                    //Eventually fuzz all this stuff
                    firstName: 'Stefano',
                    lastName: 'Sansone',
                    emailAddress: 'ses8516@rit.edu',
                    // emergencyContacts: [contactA,contactB],
                    // avatar: new File(),
                    birthday: new Date('02/23/1992'),
                    address: {
                        street: '999 Fairview Ave',
                        city: 'Rochester',
                        state: 'NY',
                        zip: '14619'
                    },
                    phone: {
                        home: '5555555555',
                        cell: '4444444444'
                    },
                    // Ranks: [rankA,rankB],
                    modified: Date.now
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){

                })
                .expect(201,stuffDone)
            });

        });

        describe('CRUD Student', function(crudDone) {

            describe('List all students', function(listDone){
                
                it('should be a list', function(shouldListDone) {
                    request(app)
                        .get('/api/students')
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            (res.body instanceof Array).should.be.true;
                        })
                        .expect(200, shouldListDone);
                });
            });

            describe('Read a student', function(readDone){

                describe('First Name field', function(firstNameDone){
                    it('should be alphanumeric', function(alphaDone) {
                        request(app)
                            .get('/api/students?firstName=Stefano')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].firstName.should.be.type('string');
                                res.body[0].firstName.should.be.equal('Stefano');
                                res.body[0].firstName.should.match(/[a-zA-Z0-9]/);
                                res.body[0].firstName.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                                //console.log(res.body);
                            })
                            .expect(200, alphaDone);
                    });
                    it('should be between 2 and 64 charracters', function(lengthDone) {
                        request(app)
                            .get('/api/students?firstName=Stefano')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].firstName.length.should.not.be.below(2);
                                res.body[0].firstName.length.should.not.be.above(64);
                            })
                            .expect(200, lengthDone);
                    });

                });

                describe('Last Name field', function(lastNameDone){
                    it('should be alphanumeric', function(alphaDone) {
                        request(app)
                            .get('/api/students?lastName=Sansone')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].lastName.should.be.type('string');
                                res.body[0].lastName.should.be.equal('Sansone');
                                res.body[0].lastName.should.match(/[a-zA-Z0-9]/);
                                res.body[0].lastName.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                            })
                            .expect(200, alphaDone);
                    });
                    it('should be between 2 and 64 charracters', function(lengthDone) {
                        request(app)
                            .get('/api/students?lastName=Sansone')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].lastName.length.should.not.be.below(2);
                                res.body[0].lastName.length.should.not.be.above(64);
                            })
                            .expect(200, lengthDone);
                    });
                });

                describe('Birthday field', function(birthdayDone){
                    it('should be in the past', function(pastDone) {
                        request(app)
                            .get('/api/students')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].birthday.should.be.lessThan(Date.now);
                            })
                            .expect(200, pastDone);
                    });
                });

                describe('Email field', function(emailDone){
                    it('should be a valid email', function(validDone) {
                        request(app)
                            .get('/api/students')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].emailAddress.should.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
                            })
                            .expect(200, validDone);
                    });
                });

                describe('Address field', function(addressDone){
                    it('should have a valid street', function(streetDone) {
                        request(app)
                            .get('/api/students')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].address.street.should.match(/[0-9]\s[a-zA-Z]/);
                                res.body[0].address.street.length.should.be.above(2);
                                res.body[0].address.street.length.should.be.below(128);  
                            })
                            .expect(200, streetDone);
                    });
                    it('should have a valid city', function(cityDone) {
                        request(app)
                            .get('/api/students')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].address.city.should.match(/[a-zA-Z-']/);
                                res.body[0].address.city.length.should.be.above(2);
                                res.body[0].address.city.length.should.be.below(64);  
                            })
                            .expect(200, cityDone);
                    });
                    it('should have a valid state', function(stateDone) {
                        request(app)
                            .get('/api/students')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].address.state.should.match(/A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY]/);
                                res.body[0].address.state.should.have.length(2);  
                            })
                            .expect(200, stateDone);
                    });
                    it('should have a valid zip code', function(zipDone) {
                        request(app)
                            .get('/api/students')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].address.zip.should.match(/[0-9]/);
                                res.body[0].address.zip.should.have.length(5);  
                            })
                            .expect(200, zipDone);
                    });
                });

                describe('Phone numbers', function(phoneDone){
                    it('should have a valid home phone', function(homeDone) {
                        request(app)
                            .get('/api/students')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body[0].phone.home.should.match(/[0-9]{10}/);  
                            })
                            .expect(200, homeDone);
                    });
                });

            });            

            // describe('Read a student from the database', function(){

            // }),

            // describe('Update an existing student in the database', function(){

            // }),

            // describe('Delete a student in the database', function(){

            // })

        });
    });