const express = require('express');
const { body, validationResult } = require('express-validator');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Device = require('../models/Device');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-api-key-here');

const router = express.Router();

// MAC address validation regex
const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

// Sanitize input function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>\"'&]/g, ''); // Basic XSS prevention
};

// POST /api/devices - Create a device
router.post('/', [
  body('name')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters')
    .customSanitizer(sanitizeInput),
  body('mac')
    .matches(macRegex)
    .withMessage('Invalid MAC address format (use XX:XX:XX:XX:XX:XX)')
    .customSanitizer((value) => value.toUpperCase()),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.logger.warn('Validation errors in device creation', { errors: errors.array(), ip: req.ip });
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, mac } = req.body;

  try {
    // Check if MAC is unique
    const existingDevice = await Device.findOne({ where: { mac } });
    if (existingDevice) {
      req.logger.warn('Attempt to create device with duplicate MAC', { mac, ip: req.ip });
      return res.status(400).json({ error: 'MAC address must be unique' });
    }

    // Generate description using Gemini AI
    let description = '';
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = `Gere uma descrição curta e útil para um dispositivo com nome "${name}" e endereço MAC "${mac}". Foque em características técnicas e possíveis usos.`;
      const result = await model.generateContent(prompt);
      description = result.response.text().trim();
    } catch (aiError) {
      req.logger.warn('Failed to generate AI description', { error: aiError.message });
      description = `Dispositivo ${name} com MAC ${mac}`;
    }

    const device = await Device.create({ name, mac, description });
    req.logger.info('Device created successfully', { deviceId: device.id, mac, ip: req.ip });
    req.io.emit('device:created', device);
    res.status(201).json(device);
  } catch (error) {
    req.logger.error('Error creating device', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/devices - List all devices
router.get('/', async (req, res) => {
  try {
    const devices = await Device.findAll();
    req.logger.info('Devices listed', { count: devices.length, ip: req.ip });
    res.json(devices);
  } catch (error) {
    req.logger.error('Error listing devices', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/devices/:id/status - Toggle status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;

  // Validate ID is numeric
  if (!/^\d+$/.test(id)) {
    req.logger.warn('Invalid device ID in status update', { id, ip: req.ip });
    return res.status(400).json({ error: 'Invalid device ID' });
  }

  try {
    const device = await Device.findByPk(id);
    if (!device) {
      req.logger.warn('Device not found for status update', { id, ip: req.ip });
      return res.status(404).json({ error: 'Device not found' });
    }

    device.status = device.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    await device.save();

    req.logger.info('Device status updated', { deviceId: id, newStatus: device.status, ip: req.ip });
    req.io.emit('device:status', device);
    res.json(device);
  } catch (error) {
    req.logger.error('Error updating device status', { error: error.message, stack: error.stack, deviceId: id });
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
