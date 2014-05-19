
var url = require('url');
var uuid = require('uuid');
var pwd = require('couch-pwd');
var ms = require('ms');
var moment = require('moment');
var Sequelize = require('sequelize');

/**
 * Adapter constructor function
 *
 * @example
   var Adapter = require('lockit-sql-adapter');
   var config = require('./config.js');
   var adapter = new Adapter(config);
 *
 * @param {Object} config
 * @constructor
 */
var Adapter = module.exports = function(config) {

  if (!(this instanceof Adapter)) return new Adapter(config);

  this.config = config;

  // create connection string
  var uri = config.db.url + config.db.name;
  var sequelize = new Sequelize(uri, {
    storage: config.db.name
  });

  this.User = sequelize.define('User', {
    // make id like CouchDB and MongoDB
    _id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    // signup
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    derived_key: Sequelize.STRING,
    salt: Sequelize.STRING,
    signupToken: Sequelize.STRING,
    signupTimestamp: Sequelize.DATE,
    signupTokenExpires: Sequelize.DATE,
    failedLoginAttempts: Sequelize.INTEGER,
    emailVerificationTimestamp: Sequelize.DATE,
    emailVerified: Sequelize.BOOLEAN,
    // forgot password
    pwdResetToken: Sequelize.STRING,
    pwdResetTokenExpires: Sequelize.DATE,
    // login
    accountLocked: Sequelize.BOOLEAN,
    accountLockedUntil: Sequelize.DATE,
    previousLoginTime: Sequelize.DATE,
    previousLoginIp: Sequelize.STRING,
    currentLoginTime: Sequelize.DATE,
    currentLoginIp: Sequelize.STRING
  }, {
    tableName: config.db.collection,   // this will define the table's name
    timestamps: false                 // this will deactivate the timestamp columns
  });

  this.User.sequelize.sync({})
    .success(function(res) {
      // you can now use User to create new instances
    })
    .error(function(err) {
      throw(err);
    });

};


/**
 * Create a new user and save it to db.
 *
 * @example
   adapter.save('john', 'john@email.com', 'secret', function(err, user) {
     if (err) console.log(err);
     console.log(user);
     // {
     //   _id: 1,
     //   name: 'john',
     //   email: 'john@email.com',
     //   derived_key: 'c4c7a83f7b3936437798316d4c7b8c7b731a55dc',
     //   salt: 'ff449a4980a58a80c4ed80bddd34b8c9',
     //   signupToken: '13eefbe7-6bc8-43f5-b27f-0bf0ca98b8db',
     //   signupTimestamp: Fri Apr 11 2014 21:37:47 GMT+0200 (CEST),
     //   signupTokenExpires: Sat Apr 12 2014 21:37:47 GMT+0200 (CEST),
     //   failedLoginAttempts: 0,
     //   emailVerificationTimestamp: null,
     //   emailVerified: null,
     //   pwdResetToken: null,
     //   pwdResetTokenExpires: null,
     //   accountLocked: null,
     //   accountLockedUntil: null,
     //   previousLoginTime: null,
     //   previousLoginIp: null,
     //   currentLoginTime: null,
     //   currentLoginIp: null
     // }
   });
 *
 * @param {String} name - User name
 * @param {String} email - User email
 * @param {String} pw - Plain text password
 * @param {Function} done - Callback function having `err` and `user` as arguments
 */
Adapter.prototype.save = function(name, email, pw, done) {
  var that = this;
  var now = moment().toDate();
  var timespan = ms(that.config.signup.tokenExpiration);
  var future = moment().add(timespan, 'ms').toDate();
  // create hashed password
  pwd.hash(pw, function(err, salt, hash) {
    if (err) return done(err);
    var user = that.User.build({
      name: name,
      email: email,
      signupToken: uuid.v4(),
      signupTimestamp: now,
      signupTokenExpires: future,
      failedLoginAttempts: 0,
      salt: salt,
      derived_key: hash
    });
    // save user to db
    user.save()
      .success(function() {
        // find user to return it in callback
        that.User.find({ where: {email: email} })
          .success(function(user) {
            done(null, user.dataValues);
          })
          .error(function(err) {
            done(err);
          });
      })
      .error(function(err) {
        done(err);
      });
  });
};

/**
 * Find a user in db.
 *
 * @example
   adapter.find('name', 'john', function(err, user) {
     if (err) console.log(err);
     console.log(user);
     // {
     //   _id: 1,
     //   name: 'john',
     //   email: 'john@email.com',
     //   derived_key: '75b43d8393715cbf476ee55b12f888246d7f7015',
     //   salt: 'f39f9a5104e5ae61347dced750b63b16',
     //   signupToken: '6c93c6f8-06b6-4c6d-be58-1e89e8590d0f',
     //   signupTimestamp: Fri Apr 11 2014 21:39:28 GMT+0200 (CEST),
     //   signupTokenExpires: Sat Apr 12 2014 21:39:28 GMT+0200 (CEST),
     //   failedLoginAttempts: 0,
     //   emailVerificationTimestamp: null,
     //   emailVerified: null,
     //   pwdResetToken: null,
     //   pwdResetTokenExpires: null,
     //   accountLocked: null,
     //   accountLockedUntil: null,
     //   previousLoginTime: null,
     //   previousLoginIp: null,
     //   currentLoginTime: null,
     //   currentLoginIp: null
     // }
   });
 *
 * @param {String} match - The key to look for. Can be `'name'`, `'email'` or `'signupToken'`
 * @param {String} query - The corresponding value for `match`
 * @param {Function} done - Callback function having `err` and `user` as arguments
 */
Adapter.prototype.find = function(match, query, done) {
  var qry = {};
  qry[match] = query;
  this.User.find({ where: qry })
    .success(function(user) {
      // create empty object in case no user is found
      user = user || {};
      done(null, user.dataValues);
    })
    .error(function(err) {
      done(err);
    });
};

/**
 * Update an already existing user in db.
 *
 * @example
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
 *
 * @param {Object} user - User object with `user._id`
 * @param {Function} done - Callback function having `err` and `user` as arguments
 */
Adapter.prototype.update = function(user, done) {
  var that = this;
  that.User.update(user, {_id: user._id})
    .success(function() {
      that.User.find(user._id)
        .success(function(user) {
          done(null, user.dataValues);
        })
        .error(function(err) {
          done(err);
        });
    })
    .error(function(err) {
      done(err);
    });
};

/**
 * Remove an existing user from db.
 *
 * @example
   adapter.remove('john', function(err, res) {
     if (err) console.log(err);
     console.log(res);
     // true
   });
 *
 * @param {String} name - Username
 * @param {Function} done - Callback function having `err` and `res` arguments
 */
Adapter.prototype.remove = function(name, done) {
  this.User.find({ where: {name: name} })
    .success(function(user) {
      if (!user) return done(new Error('lockit - Cannot find user "' + name + '"'));
      user.destroy()
        .success(function() {
          done(null, true);
        })
        .error(function(err) {
          done(err);
        });
    })
    .error(function(err) {
      done(err);
    });
};
