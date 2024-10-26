const {Pool} = require('pg');

async function sessionStarter(connectionString = null) {
  connectionString = connectionString || process.env.DB_CONNECTION;
  const pgClient = new Pool({ connectionString });

  // test the connection
  const client = await pgClient.connect();
  client.release();

  return pgClient;
}

exports.sessionStarter = sessionStarter;
