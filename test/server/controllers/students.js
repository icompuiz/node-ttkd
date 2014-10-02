/* global describe: true */
'use strict';

var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server'),
    should = require('should'),
    fuzzer = require('fuzzer'),
    otFuzzer = require('ot-fuzzer'),
    EmergencyContact = require('../../../server/models/emergencyContact');

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

        var ranks = [];
        var emergCons = [];
        var file;
        var stu;
        describe('Post Data', function(postDone){
            it('should post rank 1', function(rank1Done){
                request(app)
                .post('/api/ranks')
                .send({
                    rankOrder: 1,
                    name: 'White'
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    ranks.push(res.body._id);
                })
                .expect(201,rank1Done)
            });

            it('should post rank 2', function(rank2Done){
                request(app)
                .post('/api/ranks')
                .send({
                    rankOrder: 2,
                    name: 'Yellow'
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    ranks.push(res.body._id);
                })
                .expect(201,rank2Done)
            });

            // it('should post a img file', function(fileDone){
            //     request(app)
            //     .post('/api/files')
            //     .send({

            //     })
            //     .set('Accept', 'application/json')
            //     .set('Cookie', cookie)
            //     .set('Content-Type', 'application/json')
            //     .expect(function(res){

            //     })
            //     .expect(201,fileDone)
            // });

            it('should post a student', function(studentPostDone){
                var mom = new EmergencyContact;
                
                mom.name = 'Pamela Sansone';
                mom.email = 'psansone@gmail.com';
                mom.phoneNumber = '7654321615';
                mom.relationship = 'Mother';

                // console.log('Name: '+mom.name);
                // console.log('Email: '+mom.email);
                // console.log('Num: '+mom.phoneNumber);
                // console.log('Relationship: '+mom.relationship);

                var dad = new EmergencyContact;
                dad.name = 'Giovanni Sansone';
                dad.email = 'gsansone@gmail.com';
                dad.phoneNumber = '5161234567';
                dad.relationship = 'Father';

                request(app)
                .post('/api/students')
                .send({
                    firstName: 'Stefano',
                    lastName: 'Sansone',
                    emailAddresses: ['ses8516@rit.edu','sesansone@gmail.com'],
                    emergencyContacts: [mom,dad],
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
                    Ranks: ranks,
                    modified: Date.now
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    stu = res.body;
                })
                .expect(201,studentPostDone)
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

            describe('Read a student from the database', function(){
                it('should be that url_id matches student_id', function(readDone) {
                    request(app)
                        .get('/api/students/'+stu._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body._id.should.match(stu._id); 
                        })
                        .expect(200, readDone);
                });
            });

            describe('Create a student', function(createDone){

                describe('First Name field', function(firstNameDone){
                    it('should be alphanumeric', function(alphaDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.firstName.should.be.type('string');
                                res.body.firstName.should.be.equal('Stefano');
                                res.body.firstName.should.match(/[a-zA-Z0-9]/);
                                res.body.firstName.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                                //console.log(res.body);
                            })
                            .expect(200, alphaDone);
                    });
                    it('should be between 2 and 64 charracters', function(lengthDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.firstName.length.should.not.be.below(2);
                                res.body.firstName.length.should.not.be.above(64);
                            })
                            .expect(200, lengthDone);
                    });

                });

                describe('Last Name field', function(lastNameDone){
                    it('should be alphanumeric', function(alphaDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.lastName.should.be.type('string');
                                res.body.lastName.should.be.equal('Sansone');
                                res.body.lastName.should.match(/[a-zA-Z0-9]/);
                                res.body.lastName.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                            })
                            .expect(200, alphaDone);
                    });
                    it('should be between 2 and 64 charracters', function(lengthDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.lastName.length.should.not.be.below(2);
                                res.body.lastName.length.should.not.be.above(64);
                            })
                            .expect(200, lengthDone);
                    });
                });

                describe('Birthday field', function(birthdayDone){
                    it('should be in the past', function(pastDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.birthday.should.be.lessThan(Date.now);
                            })
                            .expect(200, pastDone);
                    });
                });

                describe('Email field', function(emailDone){
                    it('should be a list of valid emails', function(validDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                var student;
                                var email = '';
                                for(student in res.body){
                                    for(email in student.emailAddresses){
                                        email.should.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
                                    }
                                }
                            })
                            .expect(200, validDone);
                    });
                });

                describe('Address field', function(addressDone){
                    it('should have a valid street', function(streetDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.address.street.should.match(/[0-9]\s[a-zA-Z]/);
                                res.body.address.street.length.should.be.above(2);
                                res.body.address.street.length.should.be.below(128);  
                            })
                            .expect(200, streetDone);
                    });
                    it('should have a valid city', function(cityDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.address.city.should.match(/[a-zA-Z-']/);
                                res.body.address.city.length.should.be.above(2);
                                res.body.address.city.length.should.be.below(64);  
                            })
                            .expect(200, cityDone);
                    });
                    it('should have a valid state', function(stateDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.address.state.should.match(/A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY]/);
                                res.body.address.state.should.have.length(2);  
                            })
                            .expect(200, stateDone);
                    });
                    it('should have a valid zip code', function(zipDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.address.zip.should.match(/[0-9]/);
                                res.body.address.zip.should.have.length(5);  
                            })
                            .expect(200, zipDone);
                    });
                });

                describe('Phone numbers', function(phoneDone){
                    it('should have a valid home phone', function(homeDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.phone.home.should.match(/[0-9]{10}/);  
                            })
                            .expect(200, homeDone);
                    });
                });

            });   


            // describe('Update an existing student in the database', function(){
            //     it('should change students first name', function(nameChangeDone){
            //         request(app)
            //             .get('/api/students'+stu._id)
            //             .put({
            //                 firstName: 'Marco'
            //             })
            //             .expect(function(res){
            //                 res.body.firstName.should.match('Marco');
            //                 res.body.firstName.should.not.match('Stefano');
            //             })
            //             .expect(201,nameChangeDone);
            //     });
            // });

            describe('Delete a student in the database', function(){
                it('should be that url_id has no matching student_id', function(deleteDone) {
                    request(app)
                        .delete('/api/students/'+stu._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            stu._id.should.not.match(res.body._id); 
                        })
                        .expect(200, deleteDone);
                    });
            });

        });

        //Fuzzed version of the above tests
        ranks = [];
        stu = null;
        describe('Post Data', function(postDone){
            it('should post rank 1', function(rank1Done){
                request(app)
                .post('/api/ranks')
                .send({
                    rankOrder: otFuzzer.randomInt(Number.MAX_VALUE),
                    name: otFuzzer.randomWord()
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    ranks.push(res.body._id);
                })
                .expect(201,rank1Done)
            });

            it('should post rank 2', function(rank2Done){
                request(app)
                .post('/api/ranks')
                .send({
                    rankOrder: otFuzzer.randomInt(Number.MAX_VALUE),
                    name: otFuzzer.randomWord()
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    ranks.push(res.body._id);
                })
                .expect(201,rank2Done)
            });

            // it('should post a img file', function(fileDone){
            //     request(app)
            //     .post('/api/files')
            //     .send({

            //     })
            //     .set('Accept', 'application/json')
            //     .set('Cookie', cookie)
            //     .set('Content-Type', 'application/json')
            //     .expect(function(res){

            //     })
            //     .expect(201,fileDone)
            // });

            it('should post a student', function(studentPostDone){
                var mom = new EmergencyContact;
                
                mom.name = otFuzzer.randomWord();
                mom.email = otFuzzer.randomWord();
                mom.phoneNumber = otFuzzer.randomWord();
                mom.relationship = otFuzzer.randomWord();

                // console.log('Name: '+mom.name);
                // console.log('Email: '+mom.email);
                // console.log('Num: '+mom.phoneNumber);
                // console.log('Relationship: '+mom.relationship);

                var dad = new EmergencyContact;
                dad.name = otFuzzer.randomWord();
                dad.email = otFuzzer.randomWord();
                dad.phoneNumber = otFuzzer.randomWord();
                dad.relationship = otFuzzer.randomWord();

                request(app)
                .post('/api/students')
                .send({
                    //Eventually fuzz all this stuff
                    firstName: otFuzzer.randomWord(),
                    lastName: otFuzzer.randomWord(),
                    emailAddresses: [otFuzzer.randomWord(),otFuzzer.randomWord()],
                    emergencyContacts: [mom,dad],
                    // avatar: new File(),
                    birthday: new Date('02/23/1992'),
                    address: {
                        street: otFuzzer.randomWord(),
                        city: otFuzzer.randomWord(),
                        state: otFuzzer.randomWord(),
                        zip: otFuzzer.randomWord()
                    },
                    phone: {
                        home: otFuzzer.randomWord(),
                        cell: otFuzzer.randomWord()
                    },
                    Ranks: ranks,
                    modified: Date.now
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    stu = res.body;
                })
                .expect(201,studentPostDone)
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

            describe('Read a student from the database', function(){
                it('should be that url_id matches student_id', function(readDone) {
                    request(app)
                        .get('/api/students/'+stu._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body._id.should.match(stu._id); 
                        })
                        .expect(200, readDone);
                });
            });

            describe('Create a student', function(createDone){

                describe('First Name field', function(firstNameDone){
                    it('should be alphanumeric', function(alphaDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.firstName.should.be.type('string');
                                res.body.firstName.should.match(/[a-zA-Z0-9]/);
                                res.body.firstName.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                                //console.log(res.body);
                            })
                            .expect(200, alphaDone);
                    });
                    it('should be between 2 and 64 charracters', function(lengthDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.firstName.length.should.not.be.below(2);
                                res.body.firstName.length.should.not.be.above(64);
                            })
                            .expect(200, lengthDone);
                    });

                });

                describe('Last Name field', function(lastNameDone){
                    it('should be alphanumeric', function(alphaDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.lastName.should.be.type('string');
                                res.body.lastName.should.match(/[a-zA-Z0-9]/);
                                res.body.lastName.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                            })
                            .expect(200, alphaDone);
                    });
                    it('should be between 2 and 64 charracters', function(lengthDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.lastName.length.should.not.be.below(2);
                                res.body.lastName.length.should.not.be.above(64);
                            })
                            .expect(200, lengthDone);
                    });
                });

                describe('Birthday field', function(birthdayDone){
                    it('should be in the past', function(pastDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.birthday.should.be.lessThan(Date.now);
                            })
                            .expect(200, pastDone);
                    });
                });

                describe('Email field', function(emailDone){
                    it('should be a list of valid emails', function(validDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                var student;
                                var email = '';
                                for(student in res.body){
                                    for(email in student.emailAddresses){
                                        email.should.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
                                    }
                                }
                            })
                            .expect(200, validDone);
                    });
                });

                describe('Address field', function(addressDone){
                    it('should have a valid street', function(streetDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.address.street.should.match(/[0-9]\s[a-zA-Z]/);
                                res.body.address.street.length.should.be.above(2);
                                res.body.address.street.length.should.be.below(128);  
                            })
                            .expect(200, streetDone);
                    });
                    it('should have a valid city', function(cityDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.address.city.should.match(/[a-zA-Z-']/);
                                res.body.address.city.length.should.be.above(2);
                                res.body.address.city.length.should.be.below(64);  
                            })
                            .expect(200, cityDone);
                    });
                    it('should have a valid state', function(stateDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.address.state.should.match(/A[KLRZ]|C[AOT]|D[CE]|FL|GA|HI|I[ADLN]|K[SY]|LA|M[ADEINOST]|N[CDEHJMVY]|O[HKR]|P[AR]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY]/);
                                res.body.address.state.should.have.length(2);  
                            })
                            .expect(200, stateDone);
                    });
                    it('should have a valid zip code', function(zipDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.address.zip.should.match(/[0-9]/);
                                res.body.address.zip.should.have.length(5);  
                            })
                            .expect(200, zipDone);
                    });
                });

                describe('Phone numbers', function(phoneDone){
                    it('should have a valid home phone', function(homeDone) {
                        request(app)
                            .get('/api/students/'+stu._id)
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                res.body.phone.home.should.match(/[0-9]{10}/);  
                            })
                            .expect(200, homeDone);
                    });
                });

            });   


            // describe('Update an existing student in the database', function(){

            // });

            // describe('Delete a student in the database', function(){
            //     it('should be that url_id has no matching student_id', function(deleteDone) {
            //         request(app)
            //             .delete('/api/students/'+stu._id)
            //             .set('Accept', 'application/json')
            //             .set('Cookie', cookie)
            //             .set('Content-Type', 'application/json')
            //             .expect(function(res) {
            //                 stu._id.should.not.match(res.body._id); 
            //             })
            //             .expect(200, deleteDone);
            //         });
            // });
        });
    });