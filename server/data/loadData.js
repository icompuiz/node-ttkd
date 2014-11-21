'use strict';

var $async = require('async'),
    $mongoose = require('mongoose'),
    path = require('path'),
    mime = require('mime');


function removeMockObjects(doneRemovingMocks) {
    var Mock = $mongoose.model('Mock');
    Mock.remove({}, function(err) {
        if (err) {
            console.log('loadData::removeMocks::fail', err);
            return doneRemovingMocks(err);
        }
        console.log('loadData::removeMocks::success');

        doneRemovingMocks();
    });

}

function removeAccessControlLists(doneRemovingACLs) {

    var ACL = $mongoose.model('AccessControlList');
    ACL.remove({}, function(err) {
        if (err) {
            console.log('loadData::removeACLs::fail', err);
            return doneRemovingACLs(err);
        }
        console.log('loadData::removeACLs::success');

        doneRemovingACLs();
    });

}

function removeAccessControlEntries(doneRemovingACEs) {

    var ACE = $mongoose.model('AccessControlEntry');
    ACE.remove({}, function(err) {
        if (err) {
            console.log('loadData::removeACEs::fail', err);
            return doneRemovingACEs(err);
        }
        console.log('loadData::removeACEs::success');

        doneRemovingACEs();
    });
}

function removeGroups(doneRemovingGroups) {
    var Group = $mongoose.model('Group');

    console.log('loadData::removeGroups::enter');


    Group.remove({}, function(err) {
        if (err) {
            console.log('loadData::removeGroups::fail', err);
            return doneRemovingGroups(err);
        }
        console.log('loadData::removeGroups::success');

        doneRemovingGroups();
    });
}

function removeDirectories(doneRemovingDirectories) {

    var Directory = $mongoose.model('Directory');
    Directory.remove({}, function(err) {


        if (err) {
            console.log('loadData::removeDirectories::fail', err);
            return doneRemovingDirectories(err);
        }
        console.log('loadData::removeDirectories::success');
        doneRemovingDirectories();
    });

}

function removeFiles(doneRemovingFiles) {

    var File = $mongoose.model('File');
    File.remove({}, function(err) {

        if (err) {
            console.log('loadData::removeFiles::fail', err);
            return doneRemovingFiles(err);
        }
        console.log('loadData::removeFiles::success');
        doneRemovingFiles();

    });

}

function removeAssets(doneRemovingAssets) {

    var Asset = $mongoose.model('Route');

    console.log('loadData::removeAssets::enter');


    Asset.remove({}, function(err) {
        if (err) {
            console.log('loadData::removeAssets::fail', err);
            return doneRemovingAssets(err);
        }
        console.log('loadData::removeAssets::success');

        doneRemovingAssets();
    });

}

function removeUsers(doneRemovingUsers) {
    var User = $mongoose.model('User');
    console.log('loadData::removeUsers::enter');

    User.remove({}, function(err) {
        if (err) {
            console.log('loadData::removeUsers::fail', err);
            return doneRemovingUsers(err);
        }

        console.log('loadData::removeUsers::success');
        doneRemovingUsers();
    });
}

function removeStudents(doneRemovingStudents){
    var Student = $mongoose.model('Student');
    console.log('loadData::removeStudents::enter');

    Student.remove({}, function(err) {
        if(err) {
            console.log('loadData::removeStudents::fail', err);
            return doneRemovingStudents(err);
        }

        console.log('loadData::removeStudents::success');
        doneRemovingStudents();
    });
}

function removeRanks(doneRemovingRanks){
    var Rank = $mongoose.model('Rank');
    console.log('loadData::removeRanks::enter');

    Rank.remove({}, function(err) {
        if(err) {
            console.log('loadData::removeRanks::fail', err);
            return doneRemovingRanks(err);
        }

        console.log('loadData::removeRanks::success');
        doneRemovingRanks();
    });
}

function removeEmergencyContacts(doneRemovingEmergencyContacts){
    var EmergencyContact = $mongoose.model('EmergencyContact');
    console.log('loadData::removeEmergencyContacts::enter');

    EmergencyContact.remove({}, function(err) {
        if(err) {
            console.log('loadData::removeEmergencyContacts::fail', err);
            return doneRemovingEmergencyContacts(err);
        }

        console.log('loadData::removeEmergencyContacts::success');
        doneRemovingEmergencyContacts();
    });
}

function addRootDirectory(doneAddingRootDirectory) {
    var Directory = $mongoose.model('Directory');

    var rootDirectory = {
        name: 'Site Root',
        alias: 'site_root',
        system: true,
    };

    rootDirectory = new Directory(rootDirectory);

    rootDirectory.save(function(err) {
        if (err) {
            console.log('loadData::addRootDirectory::error', err);
            return doneAddingRootDirectory(err, 'addRootDirectory::error');

        }
        console.log('loadData::addRootDirectory::success');

        doneAddingRootDirectory(null, 'addRootDirectory::sucessful');
    });
}

function addUsers(doneAddingUsers) {

    var User = $mongoose.model('User');
    var userData = require('./users');

    function defineRootUser(doneAddingRootUser) {


        var root = userData.root;

        console.log('loadData::addUsers::defineRootUser::enter');
        var password = root.password;
        root.password = null;
        var user = new User(root);
        User.register(user, password, function(err) {

            if (err) {
                console.log('loadData::addUsers::defineRootUser::fail', err);
                return doneAddingRootUser(err);
            }

            console.log('loadData::addUsers::defineRootUser::success');

            doneAddingRootUser(null, 'addUsers::defineRootUser::sucessful');

        });

    }

    function defineAdministratorUser(doneAddingAdminstratorUser) {
        var administrator = userData.administrator;

        var user = new User(administrator);

        console.log('loadData::addUsers::defineAdministratorUser::enter');
        var password = administrator.password;
        administrator.password = null;
        User.register(user, password, function(err, user) {

            if (err) {
                console.log('loadData::addUsers::defineAdministratorUser::fail', err);
                return doneAddingAdminstratorUser(err);
            }

            console.log('loadData::addUsers::defineAdministratorUser::success');

            user.addToGroups(['administrators'], function(err) {

                if (err) {
                    console.log('loadData::addUsers::defineAdministratorUser::addToGroups::error');
                }
                console.log('loadData::addUsers::defineAdministratorUser::addToGroups::success');
                doneAddingAdminstratorUser(null, 'addUsers::defineAdministratorUser::sucessful');

            });

        });

    }

    function definePublicUser(doneAddingPublicUser) {

        var publicUser = userData.public;

        var user = new User(publicUser);

        console.log('loadData::addUsers::definePublicUser::enter');
        var password = publicUser.password;
        publicUser.password = null;
        User.register(user, password, function(err, user) {

            if (err) {
                console.log('loadData::addUsers::definePublicUser::fail', err);
                return doneAddingPublicUser(err);
            }

            console.log('loadData::addUsers::definePublicUser::success');

            user.addToGroups(publicUser.options.groups, function(err) {

                if (err) {
                    console.log('loadData::addUsers::definePublicUser::addToGroups::error');
                }
                console.log('loadData::addUsers::definePublicUser::addToGroups::success');
                doneAddingPublicUser(null, 'addUsers::definePublicUser::sucessful');

            });

        });

    }
    function defineCheckinUser(doneAddingCheckinUser) {

        var checkinUser = userData.checkin;

        var user = new User(checkinUser);

        console.log('loadData::addUsers::defineCheckinUser::enter');
        var password = checkinUser.password;
        checkinUser.password = null;
        User.register(user, password, function(err, user) {

            if (err) {
                console.log('loadData::addUsers::defineCheckinUser::fail', err);
                return doneAddingCheckinUser(err);
            }

            console.log('loadData::addUsers::defineCheckinUser::success');

            user.addToGroups(checkinUser.options.groups, function(err) {

                if (err) {
                    console.log('loadData::addUsers::defineCheckinUser::addToGroups::error');
                }
                console.log('loadData::addUsers::defineCheckinUser::addToGroups::success');
                doneAddingCheckinUser(null, 'addUsers::defineCheckinUser::sucessful');

            });

        });

    }

    function defineAllUsers(doneDefiningAllUsers) {
        var all = userData.all;
        console.log('loadData::addUsers::defineAllUsers::enter');
        $async.each(all, function(userData, processNextUser) {

            var user = new User(userData);
            var password = userData.password;
            userData.password = null;
            User.register(user, password, function(err, newUser) {

                if (err) {
                    console.log('loadData::addUsers::defineAllUsers::fail', userData.username, err);
                    return processNextUser(err);
                }

                if (userData.options) {
                    if (userData.options.groups) {
                        var groups = userData.options.groups;
                        newUser.addToGroups(groups, function(err) {
                            if (err) {
                                console.log('loadData::addUsers::defineAllUsers::addToGroups::error', groups, userData.username);
                                return processNextUser(err);
                            }
                            console.log('loadData::addUsers::defineAllUsers::addToGroups::success', groups, userData.username);
                            processNextUser();
                        });
                    } else {
                        console.log('loadData::addUsers::defineAllUsers::success', userData.username);
                        processNextUser();

                    }
                } else {
                    console.log('loadData::addUsers::defineAllUsers::success', userData.username);
                    processNextUser();
                }


            });

        }, function(err) {

            if (err) {
                return doneDefiningAllUsers(err, 'addUsers::defineAllUsers::error');
            }

            doneDefiningAllUsers(null, 'addUsers::defineAllUsers::sucessful');
        });
    }

    $async.series({
        root: defineRootUser,
        administrator: defineAdministratorUser,
        checkin: defineCheckinUser,
        'public': definePublicUser,
        allUsers: defineAllUsers
    }, function(err, results) {

        if (err) {
            return doneAddingUsers(err, results);
        }
        doneAddingUsers();
    });


}

function addGroups(doneAddingGroups) {
    console.log('loadData::addGroups::enter');

    var groupData = require('./groups');

    var Group = $mongoose.model('Group');
    var groups = groupData.data;

    $async.each(groups, function(groupData, processNextGroup) {
        var group = new Group(groupData);
        group.save(function(err) {
            if (err) {
                console.log('loadData::addGroups::error', groupData.name);
                return processNextGroup(err);
            }
            console.log('loadData::addGroups::success', groupData.name);
            processNextGroup();
        });
    }, function(err) {
        if (err) {
            console.log('loadData::addGroups::error', err);
            return doneAddingGroups(err);
        }
        console.log('loadData::addGroups::success');
        doneAddingGroups(null, 'addGroups::sucessful');
    });
}

function addMocks(doneAddingMocks) {

    console.log('loadData::addMocks::enter');


    var Mock = $mongoose.model('Mock');
    var mock = new Mock({
        field: 'isioma'
    });

    mock.save(function(err) {

        if (err) {
            console.log('loadData::addMocks::error', err);
            return doneAddingMocks(err, 'addMocks::error');

        }
        console.log('loadData::addMocks::success');

        doneAddingMocks(null, 'addMocks::sucessful');

    });
}


function addStudents(doneAddingStudents, data) {

    data = data || require('./students');

    console.log('loadData::addStudents::enter');


    var Student = $mongoose.model('Student');

    function afterEachStudent(error) {
        if(error) {
            return doneAddingStudents(error);
        }

        return doneAddingStudents();
    }

    function eachStudent(student, eachStudentIteratorDone) {
        function onStudentSaved(error) {
            if(error) {
                return eachStudentIteratorDone(error);                
            }

            return eachStudentIteratorDone();
        }

        var avatar = student.avatar;
        
        delete student.avatar;
        var studentDoc = new Student(student);

        if (!avatar) {
            return studentDoc.save(onStudentSaved);
        }

        // files located in data/photos
        var imageDirectory = path.join(__dirname, 'photos');

        var filename = (studentDoc.firstName + studentDoc.lastName).replace(/\W/g, '_');
        var type = mime.lookup(avatar);
        var extension = mime.extension(type);
        filename += '.' + extension;

        var copyData = {
            path: path.join(imageDirectory, avatar),
            name: filename,
            type: type
        };

        var Directory = $mongoose.model('Directory');
        var File = $mongoose.model('File');
        Directory.findOne({name:'Site Root'}, function(error, directoryDoc) {
            if(error) {
                console.log('loadData::addStudents::findSiteRoot::error', error);
                return eachStudentIteratorDone(error);
            }

            if(!directoryDoc) {
                console.log('loadData::addStudents::findSiteRoot::Root Directory not found');
                error = new Error('Root Directory not found');
                return eachStudentIteratorDone(error);
            }

            var fileData = {
                name: copyData.name,
                directory: directoryDoc._id
            };

            var file = new File(fileData);

            function onFileCopied(error, gridStoreFile) {
                if(error) {
                    return eachStudentIteratorDone(error);
                }

                function onFileSaved(error) {
                    if(error) {
                        return eachStudentIteratorDone(error);
                    }

                    studentDoc.avatar = file._id;
                    
                    return studentDoc.save(onStudentSaved);
                }

                file.fileId = gridStoreFile.fileId;
                return file.save(onFileSaved);
            }

            return file.copyFile(copyData, onFileCopied);

        });

    }

    $async.each(data, eachStudent, afterEachStudent);
}


function addAssets(doneAddingAssets) {
    console.log('loadData::addAssets::enter');

    var Asset = $mongoose.model('Route'),
        AccessControlList = $mongoose.model('AccessControlList');

    var  assetData = require('./assets');


    var assets = assetData.data;

    $async.eachSeries(assets, function(current, processNextAsset) {

        var name = current.name;
        var accessItems = current.items;

        var asset = new Asset({
            path: name
        });


        asset.save(function(err) {

            // add access
            if (err) {
                return processNextAsset(err);
            }

            $async.each(accessItems, function(accessItem, processNextAccessItem) {


                console.log('loadData::addAssets::eachAccessItem::enter for', name);

                function addUsers(doneAddingUsers) {
                    console.log('loadData::addAssets::eachAccessItem::addUsers::enter', name, asset.acl);

                    if (accessItem.users) {

                        AccessControlList
                            .addUsers(asset.acl, accessItem.users, doneAddingUsers);
                    } else {
                        doneAddingUsers();
                    }

                }

                function addGroups(doneAddingGroups) {
                    console.log('loadData::addAssets::eachAccessItem::addGroups::enter', name, asset.acl);

                    if (accessItem.groups) {
                        AccessControlList
                            .addGroups(asset.acl, accessItem.groups, doneAddingGroups);
                    } else {
                        doneAddingGroups();
                    }
                }

                console.log('loadData::addAssets::saveRoute::success', name);
                console.log('loadData::addAssets::saveRoute', 'Adding Users and Groups');

                $async.series({
                    users: addUsers,
                    groups: addGroups
                }, function(err) {
                    if (err) {
                        return processNextAccessItem(err);
                    }

                    processNextAccessItem();
                });

            }, processNextAsset);

        });







    }, function(err) {
        doneAddingAssets(err, 'loadData::addAssets::success');
    });

}

var tasks = {
    removeUsers: removeUsers,
    removeStudents: removeStudents,
    removeRanks: removeRanks,
    removeEmergencyContacts: removeEmergencyContacts,
    removeGroups: removeGroups,
    removeDirectories: removeDirectories,
    removeFiles: removeFiles,
    removeAccessControlLists: removeAccessControlLists,
    removeAccessControlEntries: removeAccessControlEntries,
    removeMockObjects: removeMockObjects,
    removeAssets: removeAssets,
    addGroups: addGroups,
    addUsers: addUsers,
    addAssets: addAssets,
    addRootDirectory: addRootDirectory,
    addMocks: addMocks,
    addStudents: addStudents
};

function main(onDataInitialized) {

    onDataInitialized = onDataInitialized || function() {};

    $async.series(tasks, function(err, results) {

        if (err) {
            console.log(err);
            return onDataInitialized(err);
        }

        console.log(results);

        onDataInitialized();
    });

    // setTimeout(onDataInitialized, 20000);

}

module.exports = {
    run: main,
    tasks: tasks
};
