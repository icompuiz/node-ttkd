'use strict';

var fs = require('fs'),
    os = require('os'),
    path = require('path'),
    _ = require('lodash'),
    async = require('async'),
    csv = require('csv'),
    moment = require('moment');

var mongoose = require('mongoose');



var parseCSV = function(csvContent, parseCSVTaskDone) {

    csv.parse(csvContent, function(err, data) {

        if (err) {
            return parseCSVTaskDone(err);
        }

        var csvHeaders = data.shift();


        var records = data.map(function(record) {


            function reduceRecord(previousValue, currentValue, index, reduceInput) {
                previousValue[reduceInput[index]] = record[index];
                return previousValue;
            }

            var mappedRecord = csvHeaders.reduce(reduceRecord, {});

            return mappedRecord;

        });

        parseCSVTaskDone(null, records);


    });

};



var saveStudents = function(studentRecords, saveStudentsTaskDone) {

    var StudentModel = mongoose.model('Student');
    var results = {
        errors: [],
        imported: []
    };

    var saveStudent = function(studentRecord, saveStudentIteratorDone) {

        studentRecord.emailAddresses = [];
        studentRecord.emergencyContacts = [];
        studentRecord.phone = {};
        studentRecord.address = {};

        if (studentRecord.emailAddress1) {
            studentRecord.emailAddresses.push(studentRecord.emailAddress1);
        }
        if (studentRecord.emailAddress2) {
            studentRecord.emailAddresses.push(studentRecord.emailAddress2);
        }
        if (studentRecord.emailAddress3) {
            studentRecord.emailAddresses.push(studentRecord.emailAddress3);
        }

        if (studentRecord.emergencyContact1Name || studentRecord.emergencyContact1Phone || studentRecord.emergencyContact1Relationship) {
            var emc1 = {
                name: studentRecord.emergencyContact1Name,
                phoneNumber: studentRecord.emergencyContact1Phone,
                relationship: studentRecord.emergencyContact1Relationship,
                email: studentRecord.emergencyContact1Email
            };

            delete studentRecord.emergencyContact1Name;
            delete studentRecord.emergencyContact1Phone;
            delete studentRecord.emergencyContact1Relationship;
            delete studentRecord.emergencyContact1Email;

            studentRecord.emergencyContacts.push(emc1);
        }
        if (studentRecord.emergencyContact2Name || studentRecord.emergencyContact2Phone || studentRecord.emergencyContact2Relationship) {
            var emc2 = {
                name: studentRecord.emergencyContact2Name,
                phoneNumber: studentRecord.emergencyContact2Phone,
                relationship: studentRecord.emergencyContact2Relationship,
                email: studentRecord.emergencyContact2Email
            };
            delete studentRecord.emergencyContact2Name;
            delete studentRecord.emergencyContact2Phone;
            delete studentRecord.emergencyContact2Relationship;
            delete studentRecord.emergencyContact2Email;

            studentRecord.emergencyContacts.push(emc2);
        }

        if (studentRecord.homePhone) {
            studentRecord.phone.home = studentRecord.homePhone;
            delete studentRecord.homePhone;
        }

        if (studentRecord.cellPhone) {
            studentRecord.phone.cell = studentRecord.cellPhone;
            delete studentRecord.cellPhone;
        }

        if (studentRecord.streetName) {
            studentRecord.address.street = studentRecord.streetName;
            delete studentRecord.streetName;
        }        

        if (studentRecord.city) {
            studentRecord.address.city = studentRecord.city;
            delete studentRecord.city;
        }

        if (studentRecord.state) {
            studentRecord.address.state = studentRecord.state;
            delete studentRecord.state;
        }
        if (studentRecord.zip) {
            studentRecord.address.zip = studentRecord.zip;
            delete studentRecord.zip;
        }

        studentRecord.firstName = studentRecord.firstName || studentRecord.firstname;
        studentRecord.lastName = studentRecord.lastName || studentRecord.lastname;

        var student = new StudentModel(studentRecord);

        console.log('Importing student record for %s %s', student.firstName, student.lastName);


        student.save(function(err) {

            if (err) {
                results.error.push({
                    message: 'Could not import student record for ' + studentRecord.firstName + ' ' + studentRecord.lastName,
                    error: err
                });
            } else {
                results.imported.push({
                    message: 'Successfully imported student record for ' + studentRecord.firstName + ' ' + studentRecord.lastName,
                    id: student._id
                });
            }

            saveStudentIteratorDone();

        });

    };

    async.each(studentRecords, saveStudent, function(err) {
        saveStudentsTaskDone(err, results);
    });
};

var mapStudents = function(studentRecords) {

    var results = _.map(studentRecords, function(studentRecord) {
        var returnObj = {
            id: studentRecord._id,
            firstname: studentRecord.firstName || studentRecord.firstname,
            lastname: studentRecord.lastName || studentRecord.lastname,
            birthday: studentRecord.birthday,
            streetName: studentRecord.address.street,
            city: studentRecord.address.city,
            state: studentRecord.address.state,
            zip: studentRecord.address.zip,
            homePhone: studentRecord.phone.home,
            cellPhone:studentRecord.phone.cell
        };

        if (studentRecord.emailAddresses[0]) {
         returnObj.emailAddress1 = studentRecord.emailAddresses[0];

        }

        if (studentRecord.emailAddresses[1]) {

         returnObj.emailAddress2 = studentRecord.emailAddresses[1];
        }

        if (studentRecord.emailAddresses[2]) {
         returnObj.emailAddress3 = studentRecord.emailAddresses[2];
        } 

        if (studentRecord.emergencyContacts[0]) {
            returnObj.emergencyContact1Name = studentRecord.emergencyContacts[0].name;
            returnObj.emergencyContact1Phone = studentRecord.emergencyContacts[0].phone;
            returnObj.emergencyContact1Relationship = studentRecord.emergencyContacts[0].relationship;
            returnObj.emergencyContact1Email = studentRecord.emergencyContacts[0].email;
        }
        if (studentRecord.emergencyContacts[1]) {
            returnObj.emergencyContact2Name = studentRecord.emergencyContacts[1].name;
            returnObj.emergencyContact2Phone = studentRecord.emergencyContacts[1].phone;
            returnObj.emergencyContact2Relationship = studentRecord.emergencyContacts[1].relationship;
            returnObj.emergencyContact2Email = studentRecord.emergencyContacts[1].email;
        }

        return returnObj;
    });

    var columns = ['id', 'firstname', 'lastname', 'emailAddress1', 'emailAddress2', 'emailAddress3', 'emergencyContact1Name', 'emergencyContact1Phone', 'emergencyContact1Relationship', 'emergencyContact2Name', 'emergencyContact2Phone', 'emergencyContact2Relationship', 'birthday', 'streetName', 'city', 'state', 'zip', 'homePhone', 'cellPhone'];
    var csvData = _.map(results, function(result) {
        var row = [];
        _.forEach(columns, function(column) {
            if (result[column]) {
                row.push(result[column].toString().replace(',', '(comma)'));
            } else {
                row.push('null');
            }
        });
        return row;
    });

    csvData.unshift(columns);

    csvData = _.map(csvData, function(row) {
        return row.join(',');
    }).join('\n');

    return csvData;

};

var mapPrograms = function(programRecords) {

    var results = _.map(programRecords, function(programRecord) {
        var returnObj = {
            id: programRecord._id,
            name: programRecord.name,
            ranks: programRecord.ranks && programRecord.ranks.join('/'),
            classes: programRecord.classes && programRecord.classes.join('/')
        };

        return returnObj;
    });

    var columns = ['id', 'name', 'ranks', 'classes'];
    var csvData = _.map(results, function(result) {
        var row = [];
        _.forEach(columns, function(column) {
            if (result[column]) {
                row.push(result[column].toString().replace(',', '(comma)'));
            } else {
                row.push('null');
            }
        });
        return row;
    });

    csvData.unshift(columns);

    csvData = _.map(csvData, function(row) {
        return row.join(',');
    }).join('\n');

    return csvData;

};

var mapWorkshops = function(records) {

    var results = _.map(records, function(record) {
        var returnObj = {
            id: record._id,
            name: record.name,
            workshopDate: record.workshopDate.toString()
        };
        
        return returnObj;
    });

    var columns = ['id', 'name', 'workshopDate'];
    var csvData = _.map(results, function(result) {
        var row = [];
        _.forEach(columns, function(column) {
            if (result[column]) {
                row.push(result[column].toString().replace(',', '(comma)'));
            } else {
                row.push('null');
            }
        });
        return row;
    });

    csvData.unshift(columns);

    csvData = _.map(csvData, function(row) {
        return row.join(',');
    }).join('\n');

    return csvData;

};

var mapClasses = function(records) {

    var results = _.map(records, function(record) {
        var returnObj = {
            id: record._id,
            name: record.name,
            program: record.program,
            students: record.students && record.students.join('/'),
            meetingTimes: record.meetingTimes && record.meetingTimes.join('/'),
        };
        
        return returnObj;
    });

    var columns = ['id', 'name', 'program', 'students', 'meetingTimes'];
    var csvData = _.map(results, function(result) {
        var row = [];
        _.forEach(columns, function(column) {
            if (result[column]) {
                row.push(result[column].toString().replace(',', '(comma)'));
            } else {
                row.push('null');
            }
        });
        return row;
    });

    csvData.unshift(columns);

    csvData = _.map(csvData, function(row) {
        return row.join(',');
    }).join('\n');

    return csvData;

};

var mapAttendance = function(records) {

    var results = _.map(records, function(record) {
        var returnObj = {
            id: record._id,
            student: record.student,
            checkInTime: record.checkInTime,
            workshop: record.workshop
        };
        
        return returnObj;
    });

    var columns = ['id', 'student', 'checkInTime', 'workshop'];
    var csvData = _.map(results, function(result) {
        var row = [];
        _.forEach(columns, function(column) {
            if (result[column]) {
                row.push(result[column].toString().replace(',', '(comma)'));
            } else {
                row.push('null');
            }
        });
        return row;
    });

    csvData.unshift(columns);

    csvData = _.map(csvData, function(row) {
        return row.join(',');
    }).join('\n');

    return csvData;

};

var mapRanks = function(records) {

    var results = _.map(records, function(record) {
        var returnObj = {
            id: record._id,
            name: record.name,
            rankOrder: record.rankOrder,
            isIntermediaryRank: record.isIntermediaryRank,
            intermediaryRanks: record.intermediaryRanks && record.intermediaryRanks.join('/')
        };
        
        return returnObj;
    });

    var columns = ['id', 'name', 'rankOrder', 'isIntermediaryRank', 'intermediaryRanks'];
    var csvData = _.map(results, function(result) {
        var row = [];
        _.forEach(columns, function(column) {
            if (result[column]) {
                row.push(result[column].toString().replace(',', '(comma)'));
            } else {
                row.push('null');
            }
        });
        return row;
    });

    csvData.unshift(columns);

    csvData = _.map(csvData, function(row) {
        return row.join(',');
    }).join('\n');

    return csvData;

};

var ImportExportCtrl = {

    importStudentData: function(req,res) {

        var keys = _.keys(req.files);

        if (!_.isEmpty(keys)) {
            var file = req.files[keys[0]];
            var contents = fs.readFileSync(file.path, {
                encoding: 'utf8'
            });

            parseCSV(contents, function(err, records) {
                if (err) {
                    return res.send(400, err.message || err);
                }
                saveStudents(records, function(err, results) {
                    return res.jsonp(200, results);
                });
            });

        }

    },
    exportStudentData: function(req, res) {
        var StudentModel = mongoose.model('Student');
        StudentModel.find().lean().exec(function(err, studentDocs) {

            if (err) {
                return res.jsonp(400, err);
            } else {
                var studentCSV = mapStudents(studentDocs);

                var tmpFile = path.join(os.tmpdir(), moment().format('YYYYMMDD-hh-mm-ss') + '-students.csv');
                fs.writeFile(tmpFile, studentCSV , function(err) {
                    if (err) {
                        return res.jsonp(400, err);
                    }
                    res.download(tmpFile, tmpFile, function(err){
                      if (err) {
                        // handle error, keep in mind the response may be partially-sent
                        // so check res.headerSent
                        fs.unlink(tmpFile, function() {});
                      } else {
                        // decrement a download credit etc
                        fs.unlink(tmpFile, function() {});
                      }
                    });
                });

            }

        });
    },
    exportProgramData: function(req, res) {
        var ProgramModel = mongoose.model('Program');
        ProgramModel.find().exec(function(err, programDocs) {

            if (err) {
                return res.jsonp(400, err);
            } else {
                var programCSV = mapPrograms(programDocs);

                var tmpFile = path.join(os.tmpdir(), moment().format('YYYYMMDD-hh-mm-ss') + '-programs.csv');
                fs.writeFile(tmpFile, programCSV , function(err) {
                    if (err) {
                        return res.jsonp(400, err);
                    }
                    res.download(tmpFile, tmpFile, function(err){
                      if (err) {
                        // handle error, keep in mind the response may be partially-sent
                        // so check res.headerSent
                        fs.unlink(tmpFile, function() {});
                      } else {
                        // decrement a download credit etc
                        fs.unlink(tmpFile, function() {});
                      }
                    });
                });
            }

        });
    },
    exportWorkshopData: function(req, res) {
        var WorkshopModel = mongoose.model('Workshop');
        WorkshopModel.find().exec(function(err, workshopDocs) {

            if (err) {
                return res.jsonp(400, err);
            } else {
                var workshopCSV = mapWorkshops(workshopDocs);

                var tmpFile = path.join(os.tmpdir(), moment().format('YYYYMMDD-hh-mm-ss') + '-workshops.csv');
                fs.writeFile(tmpFile, workshopCSV , function(err) {
                    if (err) {
                        return res.jsonp(400, err);
                    }
                    res.download(tmpFile, tmpFile, function(err){
                      if (err) {
                        // handle error, keep in mind the response may be partially-sent
                        // so check res.headerSent
                        fs.unlink(tmpFile, function() {});
                      } else {
                        // decrement a download credit etc
                        fs.unlink(tmpFile, function() {});
                      }
                    });
                });
            }

        });
    },
    exportClassData: function(req, res) {
        var ClassModel = mongoose.model('Class');
        ClassModel.find().exec(function(err, classDocs) {

            if (err) {
                return res.jsonp(400, err);
            } else {
                var classCSV = mapClasses(classDocs);

                var tmpFile = path.join(os.tmpdir(), moment().format('YYYYMMDD-hh-mm-ss') + '-classes.csv');
                fs.writeFile(tmpFile, classCSV , function(err) {
                    if (err) {
                        return res.jsonp(400, err);
                    }
                    res.download(tmpFile, tmpFile, function(err){
                      if (err) {
                        // handle error, keep in mind the response may be partially-sent
                        // so check res.headerSent
                        fs.unlink(tmpFile, function() {});
                      } else {
                        // decrement a download credit etc
                        fs.unlink(tmpFile, function() {});
                      }
                    });
                });
            }

        });
    },
    exportRankData: function(req, res) {
        var RankModel = mongoose.model('Rank');
        RankModel.find().exec(function(err, rankDoc) {

            if (err) {
                return res.jsonp(400, err);
            } else {
                var rankCSV = mapRanks(rankDoc);

                var tmpFile = path.join(os.tmpdir(), moment().format('YYYYMMDD-hh-mm-ss') + '-ranks.csv');
                fs.writeFile(tmpFile, rankCSV , function(err) {
                    if (err) {
                        return res.jsonp(400, err);
                    }
                    res.download(tmpFile, tmpFile, function(err){
                      if (err) {
                        // handle error, keep in mind the response may be partially-sent
                        // so check res.headerSent
                        fs.unlink(tmpFile, function() {});
                      } else {
                        // decrement a download credit etc
                        fs.unlink(tmpFile, function() {});
                      }
                    });
                });
            }

        });
    },
    exportAttendanceData: function(req, res) {
        var AttendanceModel = mongoose.model('Attendance');
        AttendanceModel.find().exec(function(err, attendanceDocs) {

            if (err) {
                return res.jsonp(400, err);
            } else {
                var attendanceCSV = mapAttendance(attendanceDocs);

                var tmpFile = path.join(os.tmpdir(), moment().format('YYYYMMDD-hh-mm-ss') + '-attendance.csv');
                fs.writeFile(tmpFile, attendanceCSV , function(err) {
                    if (err) {
                        return res.jsonp(400, err);
                    }
                    res.download(tmpFile, tmpFile, function(err){
                      if (err) {
                        // handle error, keep in mind the response may be partially-sent
                        // so check res.headerSent
                        fs.unlink(tmpFile, function() {});
                      } else {
                        // decrement a download credit etc
                        fs.unlink(tmpFile, function() {});
                      }
                    });
                });
            }

        });
    }
};

module.exports = ImportExportCtrl;
