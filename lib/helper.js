let _db = null;

function encryptData(value) {
    // function to encrypt one value
    // need to use encryption without an initialization vector because updating values would take too long with it
    _key = enc.getKey();
    try {
        if (_key != null && _key.length == 32) {
            let cipher = crypto.createCipher(_default_algorithm, _key)
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

function decryptData(value) {
    // function to decrypt one value
    _key = enc.getKey();
    try {
        if (_key != null && _key.length == 32) {
            let decipher = crypto.createDecipher(_default_algorithm, _key)
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

// 


exports.errorMessage =  (fnc, msg) => {
        // function for error management
        console.error("[mongocrypt] - " + fnc + "() error - " + msg)
}

exports.setDB = (db) => {
    _db = db;
}
exports.getDB = (db) => {
    return _db;
}
exports.closeDB = () => {
    if(_db != null) {
        _db.close();
        _db = null;
    }
}
exports.isConnected = () => {
    if(_db != null){
        return true;
    }else{
        return false;
    }
}