'use strict';

var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server'),
    should = require('should'),
    fuzzer = require('fuzzer'),
    otFuzzer = require('ot-fuzzer'),
    EmergencyContact = require('../../../server/models/emergencyContact');

    describe('Workshops', function() {
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
    var work;
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

        it('should post workshops', function(workshopsPostDone){
                request(app)
                .post('/api/workshops')
                .send({
                    name: otFuzzer.randomWord(),
                    workshops: classes
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    work = res.body;
                })
                .expect(201,workshopsPostDone)
            });
    });

    describe('CRUD Workshops', function() {

        describe('Create a Workshop', function() {

            it('should have a valid name', function(nameDone) {
                request(app)
                    request(app)
                    .get('/api/workshops/'+work._id)
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res) {
                        res.body.name.should.be.type('string');
                        res.body.name.should.match(/[a-zA-Z0-9]/);
                        res.body.name.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                        res.body.name.length.should.not.be.below(2);
                        res.body.name.length.should.not.be.above(64);
                        res.body.name.should.match(work.name);
                    })
                    .expect(200, nameDone);
            });

            it('should have a valid list of classes', function(classListDone) {
                request(app)
                    request(app)
                    .get('/api/workshops/'+work._id)
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res) {
                        (res.body.workshops instanceof Array).should.be.true;                    })
                    .expect(200, classListDone);
            });
        });

        describe('Read a workshop from the database', function() {
            it('should be that url_id matches workshops_id', function(readDone) {
                request(app)
                    .get('/api/workshops/'+work._id)
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res) {
                        res.body._id.should.match(work._id); 
                    })
                    .expect(200, readDone);
            });
        });
        
        describe('Update an existing workshop', function() {
            it('should change workshops name', function(nameChangeDone){
                request(app)
                    .get('/api/workshops'+work._id)
                    .put({
                        name: otFuzzer.randomWord()
                    })
                    .expect(function(res){
                        res.body.name.should.not.match(work.name);
                    })
                    .expect(201,nameChangeDone);
            });
        });

        describe('List all workshops', function(listDone){
                it('should be a list', function(shouldListDone) {
                    request(app)
                        .get('/api/workshops')
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            (res.body instanceof Array).should.be.true;
                        })
                        .expect(200, shouldListDone);
                });
            });

        describe('Delete an existing workshop', function() {
            it('should be that url_id has no matching workshop_id', function(deleteDone) {
                request(app)
                    .delete('/api/workshops/'+work._id)
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res) {
                        work._id.should.not.match(res.body._id); 
                    })
                    .expect(200, deleteDone);
                });
        });


    });
});
