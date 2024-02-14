import { createTransport } from '../lib/index.js';
import { pino } from 'pino';

const options = {
  webhookUrl:
    'add your webhook url here',
  webhookUrl: 'add your webhook url here',
  webhookType: 1,
};

const logger = pino(createTransport(options));

logger.info('Hello World!');
