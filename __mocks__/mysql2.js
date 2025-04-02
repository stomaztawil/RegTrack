// __mocks__/mysql2.js
const mockConnection = {
    query: jest.fn()
      .mockResolvedValueOnce([{ id: 1 }]) // Primeira chamada
      .mockRejectedValueOnce(new Error('DB Error')), // Segunda chamada
    end: jest.fn()
  };
  
  module.exports = {
    createPool: jest.fn(() => mockConnection)
  };