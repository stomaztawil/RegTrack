// __mocks__/logger.js
module.exports = {
    info: jest.fn().mockImplementation((msg) => {
      console.log(`[MOCK LOG] ${msg}`); // Optional: debug during tests
    }),
    error: jest.fn().mockImplementation((msg) => {
      console.error(`[MOCK ERROR] ${msg}`);
    })
  };