let _db = null;
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