require('dotenv').config();

module.exports = {
  host: process.env.AMI_HOST,
  port: parseInt(process.env.AMI_PORT),
  username: process.env.AMI_USERNAME,
  password: process.env.AMI_PASSWORD,
  events: process.env.AMI_EVENTS,
  allowedEvents: process.env.AMI_ALLOWED_EVENTS.split(',')
};