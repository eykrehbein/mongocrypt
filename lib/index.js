const importdb = require('./db');
const importenc = require('./encryption');
exports.db = importdb.db;
exports.encryption = {
    setKey: (key) => {
        importenc.setKey(key);
    }
} 