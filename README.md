# pino-discord-transport

[![npm version](https://img.shields.io/npm/v/pino-discord-transport)](https://www.npmjs.com/package/pino-discord-transport)
[![npm downloads](https://img.shields.io/npm/dm/pino-discord-transport.svg)](https://www.npmjs.com/package/pino-discord-transport)

This module provides a transport for [pino](https://github.com/pinojs/pino) to send logs over [discord](discord.com) webhooks.

## Install

```shell
yarn add pino-discord-transport
```

## Usage

For test purposes

```js

import { createTransport } from 'pino-discord-transport';
import { pino }  from 'pino';

const options = {
  webhookUrl: 'add your webhook url here',
  webhookType: 1,
};

const logger = pino(createTransport(options));

logger.info('Hello World!');

```

The code above should produce this message on your discord chat

```shell
{"level":30,"time":1700664087252,"pid":0,"hostname":"your-pc-hostname","msg":"Hello World!"}
```

This was created to be used within a [Fastify](https://github.com/fastify/fastify) application.

Here is an example on how to to use this transport within a fastify application.

```js
import Fastify from 'fastify';
import { createTransport } from 'pino-discord-transport';
import { pino } from 'pino';

const options = {
  webhookUrl: 'add your webhook url here', 
  webhookType: 1, // optional, defaults to 1 if not specified
};

const discordLogger = pino(createTransport(options));

const fastify = Fastify({
  logger: discordLogger,
});

const server = async () => {
  await fastify.ready();

  try {
    fastify.listen({
      host: 'localhost',
      port: 3000,
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

server();
```

You can also exclude some tags from being sent with the `removeTags` property

```js
const logger = pino(createTransport(options, ['pid', 'hostname']));
```

Feel free to contribute to this package by opening up a pull request.

This package was inspired on the package [pino-slack-transport](https://github.com/ChrisLahaye/pino-slack-transport). I believe the creator of the package is due some credit because I could only achieve because of their work.
