require('dotenv').config();

module.exports = {

  //DB CONFIG
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_TABLE_NAME: process.env.DB_TABLE_NAME,
};