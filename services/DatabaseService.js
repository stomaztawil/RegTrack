const EventModel = require('../models/EventModel');

class DatabaseService {
  constructor(config) {
    this.model = new EventModel(config);
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