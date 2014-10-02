'use strict';

var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server'),
    should = require('should'),
    fuzzer = require('fuzzer'),
    otFuzzer = require('ot-fuzzer'),
    EmergencyContact = require('../../../server/models/emergencyContact');

    describe('classes', function() {
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
    
        var students = [];
        var prog;
        var clas;
        describe('Post Data', function(postDone){
            it('should post student 1', function(stu1Done){
                request(app)
                .post('/api/student')
                .send({
                    name: otFuzzer.randomWord()
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    students.push(res.body._id);
                })
                .expect(201,stu1Done)
            });

            it('should post student 2', function(stu2Done){
                request(app)
                .post('/api/students')
                .send({
                    name: otFuzzer.randomWord()
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    students.push(res.body._id);
                })
                .expect(201,stu2Done)
            });

            it('should post a program', function(progDone){
                request(app)
                .post('/api/programs')
                .send({
                    name: otFuzzer.randomWord()
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    prog = res.body._id;
                })
                .expect(201,progDone)
            });


            it('should post class', function(classPostDone){
                    request(app)
                    .post('/api/classes')
                    .send({
                        name: otFuzzer.randomWord(),
                        students: students,
                        program: prog
                    })
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res){
                        clas = res.body;
                    })
                    .expect(201,classPostDone)
                });
        });

        describe('CRUD classes', function() {

            describe('Create a class', function() {

                it('should have a valid name', function(nameDone) {
                    request(app)
                        request(app)
                        .get('/api/classes/'+clas._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body.name.should.be.type('string');
                            res.body.name.should.match(/[a-zA-Z0-9]/);
                            res.body.name.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                            res.body.name.length.should.not.be.below(2);
                            res.body.name.length.should.not.be.above(64);
                            res.body.name.should.match(clas.name);
                        })
                        .expect(200, nameDone);
                });

                it('should have a valid student list', function(stuListDone) {
                    request(app)
                        request(app)
                        .get('/api/classes/'+clas._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            (res.body.students instanceof Array).should.be.true;
                        })
                        .expect(200, stuListDone);
                });
            });

            describe('Read a class from the database', function() {
                it('should be that url_id matches classes_id', function(readDone) {
                    request(app)
                        .get('/api/classes/'+clas._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body._id.should.match(clas._id); 
                        })
                        .expect(200, readDone);
                });
            });
            
            describe('Update an existing class', function() {
                it('should change classes name', function(orderDone){
                    request(app)
                        .get('/api/classes'+clas._id)
                        .put({
                            name: otFuzzer.randomWord()
                        })
                        .expect(function(res){
                            res.body.name.should.not.match(clas.name);
                        })
                        .expect(201,orderDone);
                });
            });

            describe('List all classes', function(listDone){
                    it('should be a list', function(shouldListDone) {
                        request(app)
                            .get('/api/classes')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                (res.body instanceof Array).should.be.true;
                            })
                            .expect(200, shouldListDone);
                    });
                });

            describe('Delete an existing class', function() {
                it('should be that url_id has no matching class_id', function(deleteDone) {
                    request(app)
                        .delete('/api/classes/'+clas._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            clas._id.should.not.match(res.body._id); 
                        })
                        .expect(200, deleteDone);
                    });
            });


        });
    });
