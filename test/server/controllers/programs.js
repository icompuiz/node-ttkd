'use strict';

var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server'),
    should = require('should'),
    fuzzer = require('fuzzer'),
    otFuzzer = require('ot-fuzzer'),
    EmergencyContact = require('../../../server/models/emergencyContact');

    describe('Programs', function() {
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
    
        var classes = [];
        var ranks = [];
        var program;
        describe('Post Data', function(postDone){
            it('should post class 1', function(class1Done){
                request(app)
                .post('/api/classes')
                .send({
                    name: otFuzzer.randomWord()
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    classes.push(res.body._id);
                })
                .expect(201,class1Done)
            });

            it('should post class 2', function(class2Done){
                request(app)
                .post('/api/classes')
                .send({
                    name: otFuzzer.randomWord()
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    classes.push(res.body._id);
                })
                .expect(201,class2Done)
            });

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

            it('should post program', function(programPostDone){
                    request(app)
                    .post('/api/programs')
                    .send({
                        name: otFuzzer.randomWord(),
                        classes: classes,
                        ranks: ranks
                    })
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res){
                        program = res.body;
                    })
                    .expect(201,programPostDone)
                });
        });

        describe('CRUD programs', function() {

            describe('Create a program', function() {

                it('should have a valid name', function(nameDone) {
                    request(app)
                        request(app)
                        .get('/api/programs/'+program._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body.name.should.be.type('string');
                            res.body.name.should.match(/[a-zA-Z0-9]/);
                            res.body.name.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                            res.body.name.length.should.not.be.below(2);
                            res.body.name.length.should.not.be.above(64);
                            res.body.name.should.match(program.name);
                        })
                        .expect(200, nameDone);
                });

                it('should have a valid list of classes', function(classListDone) {
                    request(app)
                        request(app)
                        .get('/api/programs/'+program._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            (res.body.classes instanceof Array).should.be.true;
                        })
                        .expect(200, classListDone);
                });

                it('should have a valid list of ranks', function(rankListDone) {
                    request(app)
                        request(app)
                        .get('/api/programs/'+program._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            (res.body.ranks instanceof Array).should.be.true;
                        })
                        .expect(200, rankListDone);
                });
            });

            describe('Read a program from the database', function() {
                it('should be that url_id matches programs_id', function(readDone) {
                    request(app)
                        .get('/api/programs/'+program._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body._id.should.match(program._id); 
                        })
                        .expect(200, readDone);
                });
            });
            
            describe('Update an existing program', function() {
                it('should change programs name', function(nameChangeDone){
                    request(app)
                        .get('/api/programs'+program._id)
                        .put({
                            name: otFuzzer.randomWord()
                        })
                        .expect(function(res){
                            res.body.name.should.not.match(program.name);
                        })
                        .expect(201,nameChangeDone);
                });
            });

            describe('List all programs', function(listDone){
                    it('should be a list', function(shouldListDone) {
                        request(app)
                            .get('/api/programs')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                (res.body instanceof Array).should.be.true;
                            })
                            .expect(200, shouldListDone);
                    });
                });

            describe('Delete an existing program', function() {
                it('should be that url_id has no matching program_id', function(deleteDone) {
                    request(app)
                        .delete('/api/programs/'+program._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            program._id.should.not.match(res.body._id); 
                        })
                        .expect(200, deleteDone);
                    });
            });


        });
    });