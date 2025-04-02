// __tests__/unit/services/DatabaseService.test.js
const DatabaseService = require('../../../lib/services/DatabaseService');

describe('DatabaseService - Cenários', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Reset entre testes
  });

  test('Sucesso ao salvar evento', async () => {
    const result = await DatabaseService.saveEvent({
      peer: 'SIP/1000',
      status: 'Reachable'
    });
    expect(result).toEqual({ id: 1 });
  });

  test('Falha ao salvar evento', async () => {
    await expect(
      DatabaseService.saveEvent({ peer: 'SIP/1000', status: 'Invalid' })
    ).rejects.toThrow('DB Error');
  });
});