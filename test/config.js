exports.dbs = {
  postgres: 'postgres://postgres:@127.0.0.1:5432/users',
  mysql: 'mysql://travis:@127.0.0.1:3306/users',
  sqlite: 'sqlite://:memory:'
};
exports.dbCollection = 'my_user_table';

exports.signup = {
  tokenExpiration: '1 day'
};