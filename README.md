# mongocrypt
### MongoCrypt is an encryption library for node.js

#### An example database entry _without_ MongoCrypt:
![example without mongocrypt](./example/images/response_normal.png)
#### The same database entry _with_ MongoCrypt:
![example without mongocrypt](./example/images/response_crypt.png)
## Introduction
MongoCrypt is a service to encrypt and decrypt your data stored in a MongoDB database. It was also designed with these principles in mind:

 * __Lightweight:__ With a 20KB index.js it's a pretty lightweight library. No unnecessary functions are included so you can care less about this encryption and concentrate more on you task.
 * __Easy to use:__ It was designed on top of the MongoDB SDK for node.js and it uses almost identical functions. The findOne function compared: 
 ```javascript
    const collection = "users";
    const query = {name: "eykjs"}

    // with mongodb's sdk
    db.collection(collection).findOne(query, (err, res) => {
        if(!err){
            console.log("Email: " + res.email);
        }else{
            console.log("Error!");
        }
    });

    // with mongocrypt
    mongocrypt.db.collection(collection).findOne(query).then(res => {
        if(res){
            console.log("Email: " + res.email);
        }else{
            console.log("Error!");
        }
    });
 ```
 * __Fast & Safe:__ On average mongocrypt is just 5-15ms slower than the MongoDB SDK (depending on the amount and size of your input values) but a lot safer. The data is encrypted by a modern 256-bit AES algorithm (AES-256-CBC by default)

## Installation & Setup
1. Install with npm - mongocrypt will install mongodb automatically after its setup
```sh
npm install mongocrypt
```
2. Require mongocrypt & connect to your database
```javascript
const mongocrypt = require('mongocrypt');
const database_url = "mongodb://yourserver:port/yourdatabase";

mongocrypt.db.connect(url).then(err => {
    if(!err) {
      ...
    }
});
```
**Everyone**
is invited to fork this project and work on it. If you create a pull request and your code is good and useful for this project, it will be merged into mongocrypt. Collaborators are also searched. For future plans have a look at [Trello](https://trello.com/b/SCrW8gsN)
## Usage

The mongocrypt functions are based on the MongoDB SDK functions. The structure is always the same. You can see each equivalent in the list below.

**Important before using database functions:**
```javascript
// Be sure you connected to the database
 if(mongocrypt.db.isConnected()){
    // Set the encryption key
    // Important: It has to be a string with the length of 32
        mongocrypt.encryption.set(yourKey);
 }else{
        // have a look at the Installation & Setup section
 }
```


**Standard usage:**

The MongoDB JS SDK function compared with the mongocrypt function
* With MongoDB's SDK: `db.collection(collection).function(parameter, callback(err, res))`
* With Mongocrypt: `db.collection(collection).function(parameter).then(err)`


The parameters of the mongocrypt functions are identical to the common SDK ones. You can find a list of them [here](https://www.w3schools.com/nodejs/nodejs_mongodb.asp). This principle works for all mongocrypt functions except `find()` and `findOne()`
```javascript
// Example how to use find() and findOne()

/* The option objects takes 3 parameters. The sort object a limit number and a filter object.
 All 3 can also be null. 
*/
const query = {pro: true}
const options = {sort: {rank: 1}, limit: 5, filter: {email: true}
}
const canAlsoBeOptions = null;
mongocrypt.collection("users").find(query, options).then(res => {
    if(res){
        console.log("Email: " + res[0].email)
    } else {
        console.log("An error appeared");
    }
})

// findOne() works on a similar way but it only takes a filter as second parameter
mongocrypt.collection("users").findOne(query, {email: true}).then(res => {})
```

## List of all Functions

* `mongocrypt.encryption.setKey(key)`
* `mongocrypt.db.connect(url).then(err)`
* `mongocrypt.db.isConnected()` *returns true or false*
* `mongocrypt.db.close()`
* `mongocrypt.db.collection(collection).insertOne(object).then(err)`
* `mongocrypt.db.collection(collection).insertMany(array).then(err)`
* `mongocrypt.db.collection(collection).updateOne(query, object).then(err)`
* `mongocrypt.db.collection(collection).updateMany(query, object).then(err)`
* `mongocrypt.db.collection(collection).findOne(query, filter).then(res)`
* `mongocrypt.db.collection(collection).find(query, options).then(res)` *options descripted above*
* `mongocrypt.db.collection(collection).deleteOne(query).then(err)`
* `mongocrypt.db.collection(collection).deleteMany(query).then(err)`
* `mongocrypt.db.collection(collection).drop(query).then(err)`

## Common errors / FAQ

 * __Error:__ `please connect first to a database with mongocrypt.db.connect(url)`
 * Solution: Look at the setup path of the README. Just fire database functions after the db.connect function has finished

 ---
 * __Error:__ `please set an encryption key first with mongocrypt.encryption.setKey(key)`
 * Solution: Set an encryption key first with encryption.setKey(key)

 ---
 * __Error:__ `the key has to have a length of 32 characters.`
 * Solution: You can only set a string as encryption key with the length of 32 characters.


Do not hesitate to open an issue or send me a message on [Twitter](https://www.twitter.com/eykjs)



