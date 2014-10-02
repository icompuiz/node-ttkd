'use strict';

var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server'),
    should = require('should'),
    fuzzer = require('fuzzer'),
    otFuzzer = require('ot-fuzzer'),
    EmergencyContact = require('../../../server/models/emergencyContact');

    describe('Ranks', function() {
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
        var rank;
        describe('Post Data', function(postDone){
            it('should post rank', function(rankPostDone){
                    request(app)
                    .post('/api/ranks')
                    .send({
                        rankOrder: otFuzzer.randomInt(Number.MAX_VALUE),
                        name: otFuzzer.randomWord(),
                    })
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res){
                        rank = res.body;
                    })
                    .expect(201,rankPostDone)
                });
        });

        describe('CRUD ranks', function() {

            describe('Create a rank', function() {

                it('should have a valid name', function(nameDone) {
                    request(app)
                        request(app)
                        .get('/api/ranks/'+rank._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body.name.should.be.type('string');
                            res.body.name.should.match(/[a-zA-Z0-9]/);
                            res.body.name.should.not.match(/[!@#$%^&*()_+={},.<>|?`~]/);
                            res.body.name.length.should.not.be.below(2);
                            res.body.name.length.should.not.be.above(64);
                            res.body.name.should.match(rank.name);
                        })
                        .expect(200, nameDone);
                });

                it('should have a valid rank order', function(orderDone) {
                    request(app)
                        request(app)
                        .get('/api/ranks/')
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            var orders = new Set()
                            for(var r in res.body){
                                orders.has(r.rankOrder).should.be.false;
                                r.rankOrder.should.be.above(0);
                                orders.add(r.rankOrder);
                            }
                        })
                        .expect(200, orderDone);
                });
            });

            describe('Read a rank from the database', function() {
                it('should be that url_id matches ranks_id', function(readDone) {
                    request(app)
                        .get('/api/ranks/'+rank._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            res.body._id.should.match(rank._id); 
                        })
                        .expect(200, readDone);
                });
            });
            
            describe('Update an existing rank', function() {
                it('should change ranks order', function(orderDone){
                    request(app)
                        .get('/api/ranks'+rank._id)
                        .put({
                            rankOrder: otFuzzer.randomInt(Number.MAX_VALUE)
                        })
                        .expect(function(res){
                            res.body.rankOrder.should.not.match(rank.rankOrder);
                        })
                        .expect(201,orderDone);
                });
            });

            describe('List all ranks', function(listDone){
                    it('should be a list', function(shouldListDone) {
                        request(app)
                            .get('/api/ranks')
                            .set('Accept', 'application/json')
                            .set('Cookie', cookie)
                            .set('Content-Type', 'application/json')
                            .expect(function(res) {
                                (res.body instanceof Array).should.be.true;
                            })
                            .expect(200, shouldListDone);
                    });
                });

            describe('Delete an existing rank', function() {
                it('should be that url_id has no matching rank_id', function(deleteDone) {
                    request(app)
                        .delete('/api/ranks/'+rank._id)
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            rank._id.should.not.match(res.body._id); 
                        })
                        .expect(200, deleteDone);
                    });
            });


        });
    });
