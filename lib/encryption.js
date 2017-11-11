const crypto = require('crypto');
const ObjectID = require('mongodb').ObjectID;
const helper = require('./helper');
let errorMessage = (fnc, msg) => helper.errorMessage(fnc, msg);

let _key = null;
let _default_algorithm = 'aes-256-cbc';


exports.getKey = () => {
    return _key;
}
exports.setKey = (key) => {
    _key = key;
}
encryptEach = (obj) => {
    for (let k in obj) {
        if (typeof obj[k] === 'object') {
            encryptEach(obj[k]);
        }
        if (typeof obj[k] !== 'object') {
            obj[k] = encryptData(obj[k]);
        }
    }
}
decryptEach = (obj) => {
    // function to decrypt objects recursive
    for (l in obj) {
        var is = isObjectID(obj[l]);
        if (typeof obj[l] !== 'object') {
            obj[l] = decryptData(obj[l]);
        }
        if (typeof obj[l] === 'object' && !is) {
            decryptEach(obj[l]);
        }
    }
}

exports.encryptEach = encryptEach;
exports.decryptEach = decryptEach;

/* non export functions */
encryptData = (value) => {
    // safer algorithm coming soon.
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

decryptData = (value) => {
    // function to decrypt one value
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
isObjectID = (value) => {
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