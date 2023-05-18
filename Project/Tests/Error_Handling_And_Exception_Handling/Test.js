const { expect } = require('chai');
const { Pool } = require('pg');

describe('Error Handling and Exception Scenarios', function () {
  let pool;

  before(async function () {
    pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'testdb',
      password: 'pwdd',
      port: 5432, // default PostgreSQL port
    });

    // Create a test table for error handling and exception scenarios
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

  it('should handle errors and exceptions gracefully', async function () {
    const client = await pool.connect();
    try {
      // Attempt to insert a record with missing required data
      const insertQuery = `
        INSERT INTO test_table (name)
        VALUES (NULL)
      `;
      let error;
      try {
        await client.query(insertQuery);
      } catch (err) {
        error = err;
      }

      expect(error).to.exist;
      expect(error.code).to.equal('23502'); // Not null violation error code

      // Attempt to insert a record with duplicate primary key
      const duplicateInsertQuery = `
        INSERT INTO test_table (id, name)
        VALUES (1, 'Duplicate')
      `;
      let duplicateError;
      try {
        await client.query(duplicateInsertQuery);
      } catch (err) {
        duplicateError = err;
      }

      expect(duplicateError).to.exist;
      expect(duplicateError.code).to.equal('23505'); // Unique violation error code
    } finally {
      client.release();
    }
  });
});
