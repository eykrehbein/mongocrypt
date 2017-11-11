const helper = require('./helper');
const encryption = require("./encryption");
const mongodb = require("mongodb").MongoClient;
let errorMessage = (fnc, msg) => helper.errorMessage(fnc, msg);

exports.db = {
    connect: (url) => {
        return new Promise((resolve, reject) => {
            mongodb.connect(url, (err, db) => {
                helper.setDB(db);
                if (err) resolve(err)
                if (!err) resolve(false)
            });
        });
    },
    close: () => {
        try {
            helper.closeDB();
        } catch (e) {
            errorMessage("disconnect", "cannot close null");
        }
    },
    isConnected: () => {
        return helper.isConnected();
    },
    collection: (collection) => {
        _db = helper.getDB();
        _key = encryption.getKey();

        let insertOne = (object) => {
            if (_key != null) {
                // check if the insert value is an object
                if (typeof object === 'object') {
                    // check if the connection to the database != null
                    if (_db != null) {
                        // encrypt each entry of the object
                        encryption.encryptEach(object);
                        // insert object
                        return new Promise((resolve, reject) => {
                            _db.collection(collection).insertOne(object, (err, res) => {
                                if (err) resolve(err);
                                if (!err) resolve(false);
                            });
                        });
                    } else {
                        errorMessage("insertOne", "please connect first to a database with mongocrypt.db.connect(url)")
                    }
                } else {
                    errorMessage("insertOne", "insertObject has to be an object");
                }
            } else {
                errorMessage("insertOne", "please set an encryption key first with mongocrypt.encryption.setKey(key)");
            }
        }

        let insertMany = (array) => {
            if (_key != null) {
                if (_db != null) {
                    // encrypt each entry of the list
                    for (let l in array) {
                        encryption.encryptEach(array[l]);
                    }
                    // insert array
                    return new Promise((resolve, reject) => {
                        _db.collection(collection).insertMany(array, (err, res) => {
                            if (err) resolve(err);
                            if (!err) resolve(false);
                        });
                    });

                } else {
                    errorMessage("insertMany", "please connect first to a database with mongocrypt.db.connect(url)")
                }
            } else {
                errorMessage("insertmany", "please set an encryption key first with mongocrypt.encryption.setKey(key)");
            }
        }

        let updateOne = (query, newdata) => {
            if (_key != null) {
                if (typeof query === 'object' && typeof newdata === 'object') {
                    if (_db != null) {
                        encryption.encryptEach(query);
                        encryption.encryptEach(newdata);
                        return new Promise((resolve, reject) => {
                            _db.collection(collection).updateOne(query, newdata, (err, res) => {
                                if (err) resolve(err);
                                if (!err) resolve(false);
                            })
                        });
                    } else {
                        errorMessage("updateOne", "please connect first to a database with mongocrypt.db.connect(url)")
                    }
                } else {
                    errorMessage("updateOne", "query and newdata have to be objects");
                }
            } else {
                errorMessage("updateOne", "please set an encryption key first with mongocrypt.encryption.setKey(key)");
            }
        }

        let updateMany = (query, newdata) => {
            if (_key != null) {
                if (typeof query === 'object' && typeof newdata === 'object') {
                    if (_db != null) {
                        encryption.encryptEach(query);
                        encryption.encryptEach(newdata);
                        return new Promise((resolve, reject) => {
                            _db.collection(collection).updateMany(query, newdata, (err, res) => {
                                if (err) resolve(err);
                                if (!err) resolve(false);
                            })
                        });
                    } else {
                        errorMessage("updateOne", "please connect first to a database with mongocrypt.db.connect(url)")
                    }
                } else {
                    errorMessage("updateOne", "query and newdata have to be objects");
                }
            } else {
                errorMessage("updateMany", "please set an encryption key first with mongocrypt.encryption.setKey(key)");
            }
        }

        let findOne = (query, filter) => {
            if (_key != null) {
                if (typeof query === 'object') {
                    if(typeof filter === 'object' || filter == null){
                    if (_db != null) {
                        encryption.encryptEach(query);
                        return new Promise((resolve, reject) => {
                            _db.collection(collection).findOne(query, filter, (err, res) => {
                                if (!err) {
                                    encryption.decryptEach(res);
                                    resolve(res);
                                }else{
                                    // returns false on an error
                                    resolve(false);
                                }
                            });
                        });
                        }else{
                            errorMessage("find", "please connect first to a database with mongocrypt.db.connect(url)");
                        }
                    } else {
                        errorMessage("find", "filter has to be an object or null");
                    }
                } else {
                    errorMessage("find", "query has to be an object");
                }
            } else {
                errorMessage("findOne", "please set an encryption key first with mongocrypt.encryption.setKey(key)");
            }
        }

        let find = (query, options) => {
            if (_key != null) {
                if (typeof query === 'object') {
                    if (typeof options === 'object' || options == null) {
                        if (_db != null) {
                            // encrypt the query because the database data is encrypted too
                            encryption.encryptEach(query);
                            // set options to an empty array if it's not a param
                            if (options == null) {
                                options = {}
                            }
                            // set options.filter to an empty object if its null/undefined. Else this would cause an error
                            if (typeof options.filter !== 'object') {
                                options.filter = {}
                            }
                            // set limit to the greatest possible number if the option is null/undefined
                            if (typeof options.limit !== 'number') {
                                options.limit = Number.MAX_SAFE_INTEGER;
                            }
                            // method without sort
                            if (options.sort == null) {
                                return new Promise((resolve, reject) => {
                                    _db.collection(collection).find(query, options.filter).limit(options.limit).toArray((err, res) => {
                                        if (!err) {
                                            for (l in res) {
                                                encryption.decryptEach(res[l]);
                                            }
                                            resolve(res);
                                        }else{
                                            resolve(false);
                                        }
                                    })
                                });
                                // method with sort
                            } else {
                                if (typeof options.sort === 'object') {
                                    return new Promise((resolve, reject) => {
                                        _db.collection(collection).find(query, options.filter).sort(options.sort).limit(options.limit).toArray((err, res) => {
                                            if (!err) {
                                                for (l in res) {
                                                    encryption.decryptEach(res[l]);
                                                }
                                                resolve(res);
                                            }else{
                                                resolve(false);
                                            }
                                        })
                                    });
                                } else {
                                    errorMessage("find", "options.sort parameter has to be an object or null");
                                }
                            }
                        } else {
                            errorMessage("find", "please connect first to a database with mongocrypt.db.connect(url)");
                        }

                    } else {
                        errorMessage("find", "options parameter has to be an object or null");
                    }
                } else {
                    errorMessage("find", "query parameter has to be an object");
                }
            } else {
                errorMessage("find", "please set an encryption key first with mongocrypt.encryption.setKey(key)");
            }
        }

        let deleteOne = (query) => {
            if (_key != null) {
                if (typeof query === 'object') {
                    if (_db != null) {
                        encryption.encryptEach(query);
                        return new Promise((resolve, reject) => {
                            _db.collection(collection).deleteOne(query, (err, obj) => {
                                if (err) resolve(err);
                                if (!err) resolve(false);
                            });
                        });
                    } else {
                        errorMessage("deleteOne", "please connect first to a database with mongocrypt.db.connect(url)");
                    }
                } else {
                    errorMessage("deleteOne", "query parameter has to be an object");
                }
            } else {
                errorMessage("deleteOne", "please set an encryption key first with mongocrypt.encryption.setKey(key)");
            }
        }

        let deleteMany = (query) => {
            if (_key != null) {
                if (typeof query === 'object') {
                    if (_db != null) {
                        encryption.encryptEach(query);
                        return new Promise((resolve, reject) => {
                            _db.collection(collection).deleteMany(query, (err, obj) => {
                                if (err) resolve(err);
                                if (!err) resolve(false);
                            });
                        });
                    } else {
                        errorMessage("deleteMany", "please connect first to a database with mongocrypt.db.connect(url)");
                    }
                } else {
                    errorMessage("deleteMany", "query parameter has to be an object");
                }
            } else {
                errorMessage("deleteMany", "please set an encryption key first with mongocrypt.encryption.setKey(key)");
            }
        }

        let drop = () => {
            if (_db != null) {
                return new Promise((resolve, reject) => {
                    _db.collection(collection).drop((err, delOK) => {
                        if (err) resolve(err);
                        if (delOK) resolve(false);
                    });
                });
            } else {
                errorMessage("drop", "please connect first to a database with mongocrypt.db.connect(url)");
            }
        }

        return {
            insertOne: insertOne,
            insertMany: insertMany,
            updateOne: updateOne,
            updateMany: updateMany,
            findOne: findOne,
            find: find,
            deleteOne: deleteOne
        }
    }
}