# Lockit SQL adapter

[![Build Status](https://travis-ci.org/zeMirco/lockit-sql-adapter.svg?branch=master)](https://travis-ci.org/zeMirco/lockit-sql-adapter) [![NPM version](https://badge.fury.io/js/lockit-sql-adapter.svg)](http://badge.fury.io/js/lockit-sql-adapter)

SQL adapter for [Lockit](https://github.com/zeMirco/lockit).

## Installation

`npm install lockit-sql-adapter`

```js
var adapter = require('lockit-sql-adapter');
```

The adapter is built on top of [sequelize](http://sequelizejs.com/).
The following databases are supported:

 - MySQL
 - MariaDB (not yet tested but should work)
 - SQLite
 - PostgreSQL

You have to install the connector for your database of choice manually.

```
npm install pg       # for postgres
npm install mysql    # for mysql
npm install sqlite3  # for sqlite
npm install mariasql # for mariasql
```

## Configuration

The following settings are required.

```js
exports.db = 'postgres://127.0.0.1:5432/users';  // for postgres
// exports.db = 'mysql://127.0.0.1:9821/users';  // for mysql
// exports.db = 'sqlite://:memory:';             // for sqlite
exports.dbCollection = 'my_user_table';             // table name
```

## Features

### 1. Create user

`adapter.save(name, email, pass, callback)`

 - `name`: String - i.e. 'john'
 - `email`: String - i.e. 'john@email.com'
 - `pass`: String - i.e. 'password123'
 - `callback`: Function - `callback(err, user)` where `user` is the new user now in our database.

The `user` object has the following properties

 - `_id`: unique id
 - `email`: email that was provided at the beginning
 - `hash`: hashed password using [bcrypt](https://github.com/ncb000gt/node.bcrypt.js/)
 - `signupTimestamp`: Date object to remember when the user signed up
 - `signupToken`: unique token sent to user's email for email verification
 - `signupTokenExpires`: Date object usually 24h ahead of `signupTimestamp`
 - `name`: name chosen during sign up
 - `failedLoginAttempts`: save failed login attempts during login process, default is `0`

```js
adapter.save('john', 'john@email.com', 'secret', function(err, user) {
  if (err) console.log(err);
  console.log(user);
  // {
  //  _id: 1,
  //  name: 'john',
  //  email: 'john@email.com',
  //  signupToken: 'fed26ce9-2628-405a-b9fa-285d4a66f4c3',
  //  signupTimestamp: '2013-09-21T10:10:50.357Z',
  //  signupTokenExpires: '2014-01-15T15:27:29.020Z',
  //  failedLoginAttempts: 0,
  //  hash: '$2a$10$OUNHWf0nCksGgrVqR7O3f.YqqDTuTTe5HqGMw0OiNMy0cixwSS5Km'
  // }
});
```

### 2. Find user

`adapter.find(match, query, callback)`

 - `match`: String - one of the following: 'name', 'email' or 'signupToken'
 - `query`: String - corresponds to `match`, i.e. 'john@email.com'
 - `callback`:  Function - `callback(err, user)`

```js
adapter.find('name', 'john', function(err, user) {
  if (err) console.log(err);
  console.log(user);
  // {
  //  _id: 1,
  //  name: 'john',
  //  email: 'john@email.com',
  //  signupToken: 'fed26ce9-2628-405a-b9fa-285d4a66f4c3',
  //  signupTimestamp: '2013-09-21T10:10:50.357Z',
  //  signupTokenExpires: '2014-01-15T15:28:37.762Z',
  //  failedLoginAttempts: 0,
  //  hash: '$2a$10$OUNHWf0nCksGgrVqR7O3f.YqqDTuTTe5HqGMw0OiNMy0cixwSS5Km'
  // }
});
```

### 3. Update user

`adapter.update(user, callback)`

 - `user`: Object - must have `_id` key
 - `callback`: Function - `callback(err, user)` - `user` is the updated user object

```js
// get a user from db first
adapter.find('name', 'john', function(err, user) {
  if (err) console.log(err);

  // add some new properties to our existing user
  user.firstOldKey = 'and some value';
  user.secondOldKey = true;

  // save updated user to db
  adapter.update(user, function(err, user) {
    if (err) console.log(err);
    // ...
  });
});
```

### 4. Delete user

`adapter.remove(name, callback)`

 - `name`: String
 - `callback`: Function - `callback(err, res)` - `res` is `true` if everything went fine

```js
adapter.remove('john', function(err, res) {
  if (err) console.log(err);
  console.log(res);
  // true
});
```

## Test

`grunt`

## License

Copyright (C) 2013 [Mirco Zeiss](mailto: mirco.zeiss@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
