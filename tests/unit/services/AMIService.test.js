// __tests__/unit/services/AMIService.test.js
jest.mock('../../../lib/models/EventModel', () => ({
    create: jest.fn().mockResolvedValue({ eventId: 123 })
  }));
  
  const AMIService = require('../../../lib/services/AMIService');
  const EventModel = require('../../../lib/models/EventModel');
  
  test('Needs to invoke EventModel.create', async () => {
    await AMIService._handleEvent({ peer: 'SIP/1001', status: 'Reachable' });
    expect(EventModel.create).toHaveBeenCalledWith({
      peer: 'SIP/1001',
      event_type: 'Reachable'
    });
  });