const { expect } = require('chai');
const { Pool } = require('pg');

describe('Performance and Scalability', function () {
  let pool;

  before(async function () {
    pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'testdb',
      password: 'pwdd',
      port: 5432, // default PostgreSQL port
      max: 20, // Maximum number of clients in the connection pool
    });

    // Create a test table for performance and scalability testing
    const createTableQuery = `
      CREATE TABLE test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `;
    const client = await pool.connect();
    try {
      await client.query(createTableQuery);
    } finally {
      client.release();
    }
  });

  after(async function () {
    // Drop the test table
    const dropTableQuery = `DROP TABLE IF EXISTS test_table`;
    const client = await pool.connect();
    try {
      await client.query(dropTableQuery);
    } finally {
      client.release();
    }
  });

  it('should handle multiple concurrent requests efficiently', async function () {
    const concurrentRequests = 100; // Number of concurrent requests to simulate

    const client = await pool.connect();
    try {
      // Insert multiple records concurrently
      const insertPromises = [];
      for (let i = 0; i < concurrentRequests; i++) {
        const insertQuery = `
          INSERT INTO test_table (name)
          VALUES ('Record ${i}')
        `;
        insertPromises.push(client.query(insertQuery));
      }
      await Promise.all(insertPromises);

      // Retrieve the count of inserted records
      const selectQuery = `SELECT COUNT(*) FROM test_table`;
      const result = await client.query(selectQuery);
      const recordCount = parseInt(result.rows[0].count);

      // Validate that all records were inserted
      expect(recordCount).to.equal(concurrentRequests);
    } finally {
      client.release();
    }
  });
});
