exports.dbs = {
  postgres: {
    url: 'postgres://postgres:@127.0.0.1:5432/',
    name: 'users',
    collection: 'my_user_table'
  },
  mysql: {
    url: 'mysql://travis:@127.0.0.1:3306/',
    name: 'users',
    collection: 'my_user_table'
  },
  sqlite: {
    url: 'sqlite://',
    name: ':memory:',
    collection: 'my_user_table'
  }
};

exports.signup = {
  tokenExpiration: '1 day'
};
