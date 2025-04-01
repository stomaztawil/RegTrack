import dotenv from 'dotenv';

dotenv.config();

module.exports = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    tableName: process.env.DB_TABLE_NAME
  };