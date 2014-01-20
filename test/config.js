exports.db = 'sql';
exports.dbUrls = {
  postgres: 'postgres://127.0.0.1:5432/users',
  mysql: 'mysql://127.0.0.1:8889/users',
  sqlite: 'sqlite://:memory:'
};
exports.dbCollection = 'my_user_table';