/** Database setup for BizTime. */

const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://biztime:bizpassword@localhost/biztime'
});

client.connect();

module.exports = client;
