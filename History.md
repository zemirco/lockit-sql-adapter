
##### 0.4.0 - 2014-04-10

- `username` becomes `name`
- use built-in [pbkdf2](http://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_callback)
  instead [bcrypt](https://github.com/ncb000gt/node.bcrypt.js/)

##### 0.3.0 - 2014-04-03

- simplify `remove()` method

  ```js
  adapter.remove(match, query, callback)
  ```

  becomes

  ```js
  adapter.remove(username, callback)
  ```

...

##### 0.0.1 / 2014-01-19

 - initial release
