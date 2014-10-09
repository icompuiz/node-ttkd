'use strict';

var express = require('express'),
    request = require('supertest'),
    server = require('../../../server/server'),
    should = require('should'),
    fuzzer = require('fuzzer'),
    otFuzzer = require('ot-fuzzer'),
    EmergencyContact = require('../../../server/models/emergencyContact');

    describe('Workshop Attendance Lists', function() {
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
    var work;
    describe('Post Data', function(postDone){
        it('should post student 1', function(student1Done){
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
            .expect(201,student1Done)
        });

        it('should post student 2', function(student2Done){
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
            .expect(201,student2Done)
        });

        it('should post workshop Attendance list', function(workshopAttListPostDone){
                request(app)
                .post('/api/workshops')
                .send({
                    students: students,
                    workshopDate: Date.now()
                })
                .set('Accept', 'application/json')
                .set('Cookie', cookie)
                .set('Content-Type', 'application/json')
                .expect(function(res){
                    work = res.body;
                })
                .expect(201,workshopAttListPostDone)
            });
    });

    describe('CRUD Workshop Attendance list', function() {

        describe('Create a Workshop Attendance List', function() {
            
            it('should have a valid list of students', function(studentListDone) {
                request(app)
                    request(app)
                    .get('/api/workshopattendancelists/'+work._id)
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res) {
                        res.body.students.should.be.type('array');
                    })
                    .expect(200, studentListDone);
            });

            it('should have a valid list date', function(dateDone) {
                request(app)
                    request(app)
                    .get('/api/workshopattendancelists/'+work._id)
                    .set('Accept', 'application/json')
                    .set('Cookie', cookie)
                    .set('Content-Type', 'application/json')
                    .expect(function(res) {
                        res.body.workshopDate.should.be.type('date');
                    })
                    .expect(200, dateDone);
            });
        });

        describe('Read a workshop Attendance list from the database', function() {
            it('should be that url_id matches workshopattendancelist_id', function(readDone) {
                request(app)
                    .get('/api/workshopattendancelists/'+work._id)
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
            it('should remove a student', function(removeeDone){
                students.pop();
                request(app)
                    .get('/api/workshopattendancelists'+work._id)
                    .put({
                        students: students
                    })
                    .expect(function(res){
                        res.body.students.length.should.be.below(2);
                    })
                    .expect(201,removeDone);
            });
        });

        describe('List all workshop Attendance lists', function(listDone){
                it('should be a list', function(shouldListDone) {
                    request(app)
                        .get('/api/workshopattendancelists')
                        .set('Accept', 'application/json')
                        .set('Cookie', cookie)
                        .set('Content-Type', 'application/json')
                        .expect(function(res) {
                            (res.body instanceof Array).should.be.true;
                        })
                        .expect(200, shouldListDone);
                });
            });

        describe('Delete an existing workshop Attendance list', function() {
            it('should be that url_id has no matching workshop_id', function(deleteDone) {
                request(app)
                    .delete('/api/workshopattendancelists/'+work._id)
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
