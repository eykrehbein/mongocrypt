const mongodb = require("mongodb").MongoClient;
let ObjectID = require('mongodb').ObjectID;
const crypto = require('crypto');

let _db = null;
let _default_algorithm = 'aes-256-cbc';
let _key = null;
exports.db = {
    /* section Connection */
    connect: (url) => {
        return new Promise((resolve, reject) => {
            mongodb.connect(url, (err, db) => {
                this._db = db;
                if (err) resolve(err)
                if (!err) resolve(false)
            });
        });
    },
    close: () => {
        try {
            this._db.close();
        } catch (e) {
            errorMessage("disconnect", "cannot close null");
        }
        this._db = null;
    },
    isConnected: () => {
        if (this._db != null) {
            return true;
        } else {
            return false;
        }
    },
    /* endof Connection */
    /* section Collection */
    collection: (collection) => {
        _db = this._db;
        let insertOne = (object) => {
            if (_key != null) {
                let key = _key;
                // check if the insert value is an object
                if (typeof object === 'object') {
                    // check if the connection to the database != null
                    if (this._db != null) {
                        // encrypt each entry of the object
                        encryptEach(object, key);
                        // insert object
                        return new Promise((resolve, reject) => {
                            this._db.collection(collection).insertOne(object, (err, res) => {
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
                let key = _key;
                if (this._db != null) {
                    // encrypt each entry of the list
                    for (let l in array) {
                        encryptEach(array[l], key);
                    }
                    // insert array
                    return new Promise((resolve, reject) => {
                        this._db.collection(collection).insertMany(array, (err, res) => {
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
                let key = _key;
                if (typeof query === 'object' && typeof newdata === 'object') {
                    if (this._db != null) {
                        encryptEach(query, key);
                        encryptEach(newdata, key);
                        return new Promise((resolve, reject) => {
                            this._db.collection(collection).updateOne(query, newdata, (err, res) => {
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
                let key = _key;
                if (typeof query === 'object' && typeof newdata === 'object') {
                    if (this._db != null) {
                        encryptEach(query, key);
                        encryptEach(newdata, key);
                        return new Promise((resolve, reject) => {
                            this._db.collection(collection).updateMany(query, newdata, (err, res) => {
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
                let key = _key;
                if (typeof query === 'object' && typeof filter === 'object') {
                    if (this._db != null) {
                        encryptEach(query, key);
                        return new Promise((resolve, reject) => {
                            this._db.collection(collection).findOne(query, filter, (err, res) => {
                                if (!err) {
                                    decryptEach(res, key);
                                    resolve(res);
                                }else{
                                    // returns false on an error
                                    resolve(false);
                                }
                            });
                        });
                    } else {
                        errorMessage("find", "please connect first to a database with mongocrypt.db.connect(url)");
                    }
                } else {
                    errorMessage("find", "query and filter have to be objects");
                }
            } else {
                errorMessage("findOne", "please set an encryption key first with mongocrypt.encryption.setKey(key)");
            }
        }
        let find = (query, options) => {
            if (_key != null) {
                let key = _key;
                if (typeof query === 'object') {
                    if (typeof options === 'object' || options == null) {
                        if (this._db != null) {
                            // encrypt the query because the database data is encrypted too
                            encryptEach(query, key);
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
                                    this._db.collection(collection).find(query, options.filter).limit(options.limit).toArray((err, res) => {
                                        if (!err) {
                                            for (l in res) {
                                                decryptEach(res[l], key);
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
                                        this._db.collection(collection).find(query, options.filter).sort(options.sort).limit(options.limit).toArray((err, res) => {
                                            if (!err) {
                                                for (l in res) {
                                                    decryptEach(res[l], key);
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
                let key = _key;

                if (typeof query === 'object') {
                    if (this._db != null) {
                        encryptEach(query, key);
                        return new Promise((resolve, reject) => {
                            this._db.collection(collection).deleteOne(query, (err, obj) => {
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
                let key = _key;

                if (typeof query === 'object') {
                    if (this._db != null) {
                        encryptEach(query, key);
                        return new Promise((resolve, reject) => {
                            this._db.collection(collection).deleteMany(query, (err, obj) => {
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
            if (this._db != null) {
                return new Promise((resolve, reject) => {
                    this._db.collection(collection).drop((err, delOK) => {
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
            deleteOne: deleteOne,
            deleteMany: deleteMany,
            drop: drop
        }
    }
    /* endof Collection */
}
exports.encryption = {
    setKey: (key) => {
        _key = key;
    }
}
/* section Helper */
function isObjectID(value) {
    // function to check if an object is an objectid. Necessary for find()
    try {
        var newObjID = new ObjectID(value);
        if (value == newObjID) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        // do nothing
    }
}

function encryptEach(obj, key) {
    // function to encrypt objects recursive
    for (let k in obj) {
        if (typeof obj[k] === 'object') {
            encryptEach(obj[k], key);
        }
        if (typeof obj[k] !== 'object') {
            obj[k] = encryptData(obj[k], key);
        }
    }
}

function decryptEach(obj, key) {
    // function to decrypt objects recursive
    for (l in obj) {
        var is = isObjectID(obj[l]);
        if (typeof obj[l] !== 'object') {
            obj[l] = decryptData(obj[l], key);
        }
        if (typeof obj[l] === 'object' && !is) {
            decryptEach(obj[l], key);
        }
    }
}

function encryptData(value, key) {
    // function to encrypt one value
    // need to use encryption without an initialization vector because updating values would take too long with it
    try {
        if (key != null && key.length == 32) {
            let cipher = crypto.createCipher(_default_algorithm, key)
            let crypted = cipher.update(value.toString(), 'utf8', 'hex')
            crypted += cipher.final('hex');
            return crypted;
        } else {
            errorMessage("insert/update", "the key has to have length of 32 characters. The database values were filled with null");
            return null;
        }
    } catch (e) {
        errorMessage("insert/update", "error while encrypting: " + e + " - The database values were filled with null");
        return null;
    }

}

function decryptData(value, key) {
    // function to decrypt one value
    try {
        if (key != null && key.length == 32) {
            let decipher = crypto.createDecipher(_default_algorithm, key)
            let dec = decipher.update(value.toString(), 'hex', 'utf8')
            dec += decipher.final('utf8');
            return dec;
        } else {
            errorMessage("find", "the key has to have of 32 characters.");
            return null;
        }
    } catch (e) {
        errorMessage("find", "error while encrypting: " + e);
        return null;
    }
}

function errorMessage(fnc, msg) {
    // function for error management
    console.error("[mongocrypt] - " + fnc + "() error - " + msg)
}
/* endof Helper */