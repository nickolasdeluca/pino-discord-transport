import { createTransport } from '../lib/index.js';
import { pino } from 'pino';

const options = {
  webhookUrl:
    'add your webhook url here',
  webhookUrl: 'add your webhook url here',
  webhookType: 1,
  title: 'Test',
};

const logger = pino(createTransport(options));

logger.info('Hello World!');
logger.error('Error!');
logger.debug('Debug!');
logger.warn('Warning!');
logger.fatal('Fatal!');
logger.trace('Trace!');
