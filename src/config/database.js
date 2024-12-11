const { open } = require('lmdb');

const db = open({
  path: 'data.mdb',
  compression: true
});

module.exports = db;