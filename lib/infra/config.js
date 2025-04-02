require('dotenv').config();

module.exports = {
  //AMI CONFIG
  host: process.env.AMI_HOST,
  port: parseInt(process.env.AMI_PORT),
  username: process.env.AMI_USERNAME,
  password: process.env.AMI_PASSWORD,
  events: process.env.AMI_EVENTS,
  allowedEvents: process.env.AMI_ALLOWED_EVENTS.split(',')

  //DB CONFIG
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  tableName: process.env.DB_TABLE_NAME
};