const { expect } = require('chai');
const { Pool } = require('pg');

describe('Data Integrity and Consistency', function () {
  let pool;

  before(async function () {
    pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'testdb',
      password: 'pwdd',
      port: 5432, // default PostgreSQL port
    });

    // Create a test table for data integrity and consistency
    const createTableQuery = `
      CREATE TABLE test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE
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

  it('should enforce uniqueness constraint on email field', async function () {
    const client = await pool.connect();
    try {
      const insertQuery = `
        INSERT INTO test_table (name, email)
        VALUES ('John Doe', 'john@example.com')
      `;
      await client.query(insertQuery);

      // Attempt to insert a duplicate email
      const duplicateInsertQuery = `
        INSERT INTO test_table (name, email)
        VALUES ('Jane Doe', 'john@example.com')
      `;
      let error;
      try {
        await client.query(duplicateInsertQuery);
      } catch (err) {
        error = err;
      }

      expect(error).to.exist;
      expect(error.code).to.equal('23505'); // Unique violation error code
    } finally {
      client.release();
    }
  });

  it('should maintain data integrity and consistency', async function () {
    const client = await pool.connect();
    try {
      const insertQuery = `
        INSERT INTO test_table (name, email)
        VALUES ('John Doe', 'john@example.com')
        RETURNING id
      `;
      const result = await client.query(insertQuery);
      const insertedId = result.rows[0].id;

      // Update the name for the inserted record
      const updateQuery = `
        UPDATE test_table
        SET name = 'Updated Name'
        WHERE id = ${insertedId}
      `;
      await client.query(updateQuery);

      // Retrieve the record and verify the updated name
      const selectQuery = `
        SELECT name
        FROM test_table
        WHERE id = ${insertedId}
      `;
      const selectResult = await client.query(selectQuery);
      expect(selectResult).to.exist;
      expect(selectResult.rows.length).to.equal(1);
      expect(selectResult.rows[0].name).to.equal('Updated Name');
    } finally {
      client.release();
    }
  });
});
