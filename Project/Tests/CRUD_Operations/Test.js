const { expect } = require('chai');
const { Pool } = require('pg');

describe('CRUD Operations', function () {
  let pool;

  before(async function () {
    pool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'testdb',
      password: 'pwdd',
      port: 5432, // default PostgreSQL port
    });

    // Create a test table for CRUD operations
    const createTableQuery = `
      CREATE TABLE test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL
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

  it('should create a new record', async function () {
    const client = await pool.connect();
    try {
      const insertQuery = `
        INSERT INTO test_table (name, email)
        VALUES ('John Doe', 'john@example.com')
        RETURNING id
      `;
      const result = await client.query(insertQuery);
      expect(result).to.exist;
      expect(result.rows.length).to.equal(1);
      expect(result.rows[0].id).to.be.a('number');
    } finally {
      client.release();
    }
  });

  it('should read the created record', async function () {
    const client = await pool.connect();
    try {
      const selectQuery = `SELECT * FROM test_table`;
      const result = await client.query(selectQuery);
      expect(result).to.exist;
      expect(result.rows.length).to.equal(1);
      expect(result.rows[0].name).to.equal('John Doe');
      expect(result.rows[0].email).to.equal('john@example.com');
    } finally {
      client.release();
    }
  });

  it('should update the record', async function () {
    const client = await pool.connect();
    try {
      const updateQuery = `
        UPDATE test_table
        SET email = 'updated@example.com'
        RETURNING *
      `;
      const result = await client.query(updateQuery);
      expect(result).to.exist;
      expect(result.rows.length).to.equal(1);
      expect(result.rows[0].email).to.equal('updated@example.com');
    } finally {
      client.release();
    }
  });

  it('should delete the record', async function () {
    const client = await pool.connect();
    try {
      const deleteQuery = `DELETE FROM test_table`;
      const result = await client.query(deleteQuery);
      expect(result).to.exist;
      expect(result.rowCount).to.equal(1);
    } finally {
      client.release();
    }
  });
});
