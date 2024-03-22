# pino-discord-transport

[![npm version](https://img.shields.io/npm/v/pino-discord-transport)](https://www.npmjs.com/package/pino-discord-transport)
[![npm downloads](https://img.shields.io/npm/dm/pino-discord-transport.svg)](https://www.npmjs.com/package/pino-discord-transport)

This module provides a transport for [pino](https://github.com/pinojs/pino) to send logs over [discord](discord.com) webhooks.

## Install

```shell
yarn add pino-discord-transport
```

## Usage
For test
```js
import { pino } from 'pino';
const url = 'MyWebHook Url';
import { createTransport } from "../lib/index";
const logger = pino(
  createTransport({
    webhooks: [
      url
    ],
  })
);
logger.info("hello world");
logger.warn("hello world");
```

## Properties
|Properties|Description|Type|Default|
| --- | --- | --- | --- |
|webhooks| webhooks urls | string[] | no default|
|filterMsgByKeyword | Specific keywords in the log message and stop them from being sent | string[]| null |
|removeTags| Exclude some tags from being sent | string[] | null |
|colors | Colors of embers | object | my custom color :D |