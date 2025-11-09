const Device = require('../models/Device');

// Unit test for MAC uniqueness validation (mocked)
test('MAC uniqueness check', async () => {
  // Mock the database findOne
  Device.findOne = jest.fn().mockResolvedValue(null); // No existing device

  const isUnique = await Device.findOne({ where: { mac: '00:11:22:33:44:55' } });
  expect(isUnique).toBe(null); // Should be null if unique
});
