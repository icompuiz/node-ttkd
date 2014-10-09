/* global describe: true */
'use strict';

var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server'),
    should = require('should'),
    fuzzer = require('fuzzer'),
    otFuzzer = require('ot-fuzzer');

    describe('Log In to Management', function(done) {
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

        describe('login to application', function(loginToApplicationDone) {
            it('should login successfully', function(shouldLoginSuccessfullyDone) {
                request(app)
                    .post('/login')
                    .send({
                        username: 'administrator',
                        password: 'password'
                    })
                    .expect(200, shouldLoginSuccessfullyDone);
            });
        });

        describe('login to application', function(loginToAppFailDone) {
            it('should have login fail', function(shouldLoginUnSuccessfullyDone) {
                request(app)
                    .post('/login')
                    .send({
                        username: otFuzzer.randomWord(),
                        password: otFuzzer.randomWord()
                    })
                    .expect(401, shouldLoginUnSuccessfullyDone);
            });
        });

    });
