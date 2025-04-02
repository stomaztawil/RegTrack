require('dotenv').config();

module.exports = {
  //AMI CONFIG
  AMI_HOST: process.env.AMI_HOST,
  AMI_PORT: parseInt(process.env.AMI_PORT),
  AMI_USER: process.env.AMI_USERNAME,
  AMI_PASSWORD: process.env.AMI_PASSWORD,
  AMI_EVENTS: process.env.AMI_EVENTS,
  AMI_ALLOWED_EVENTS: process.env.AMI_ALLOWED_EVENTS.split(','),

  //DB CONFIG
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_TABLE_NAME: process.env.DB_TABLE_NAME
};