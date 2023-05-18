const { expect } = require('chai');
const { Pool } = require('pg');

describe('Database Connectivity and Authentication', function () {
  it('should successfully connect to the database', async function () {
    const pool = new Pool({
      user: 'your_username',
      host: 'localhost',
      database: 'your_database_name',
      password: 'your_password',
      port: 5432, // default PostgreSQL port
    });

    const client = await pool.connect();
    try {
      expect(client).to.exist;
      expect(client._connected).to.be.true;
    } finally {
      client.release();
    }
  });

  it('should authenticate with the correct credentials', async function () {
    const pool = new Pool({
      user: 'your_username',
      host: 'localhost',
      database: 'your_database_name',
      password: 'your_password',
      port: 5432, // default PostgreSQL port
    });

    const client = await pool.connect();
    try {
      const result = await client.query('SELECT 1');
      expect(result).to.exist;
      expect(result.rows.length).to.equal(1);
      expect(result.rows[0].count).to.equal('1');
    } finally {
      client.release();
    }
  });
});
