const EventModel = require('../models/EventModel');

class DatabaseService {
  constructor(config, logger) {
    this.model = new EventModel(config, logger);
  }

  async initialize() {
    await this.model.initialize();
  }

  async close() {
    await this.model.close();
  }

  getModel() {
    return this.model;
  }
}

module.exports = DatabaseService;