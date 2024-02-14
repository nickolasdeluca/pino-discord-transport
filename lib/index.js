import build from 'pino-abstract-transport';
import fetch from 'node-fetch';
import https from 'https';

const colors = {
  10: 0x808080,
  20: 0x008000,
  30: 0x00bfff,
  40: 0xffa500,
  50: 0xff4500,
  60: 0xff0000,
  default: 0x440f3c,
};

const process = async ({
  agent,
  log,
  options: { webhookUrl, webhookType = 1, title },
}) => {
  try {
    const color = colors[log.level] || colors.default;

    let fields = Object.keys(log).map((key) => ({
      name: key,
      value: log[key],
    }));

    fields.push({
      name: 'raw',
      value: JSON.stringify(log),
    });

    const embed = {
      title: title,
      color: color,
      fields: fields,
    };

    const payload = {
      type: webhookType,
      embeds: [embed],
    };

    const response = await fetch(webhookUrl, {
      agent,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `Failed to send log to webhook. Status: ${response.status}`
      );
    }
  } catch (err) {
    console.error('Error during webhook request:', err);
  }
};

const removeTagsFromLog = (log, tagsToRemove) => {
  for (const tag of tagsToRemove) {
    delete log[tag];
  }
};

const formatLogTime = (log) => {
  if (log.time) {
    log.time = new Date(log.time).toLocaleString();
  }
};

const prepare = async (log, removeTags) => {
  removeTagsFromLog(log, removeTags);
  formatLogTime(log);
};

export const createTransport = (
  options,
  removeTags = [],
  filterMsgByKeyword = []
) => {
  const agent =
    options.keepAlive === true
      ? new https.Agent({ keepAlive: true })
      : undefined;

  return build(async (iterable) => {
    iterable.forEach(async (log) => {
      try {
        if (
          filterMsgByKeyword.some((keyword) =>
            log.msg.toLowerCase().includes(keyword)
          )
        ) {
          return;
        }

        prepare(log, removeTags);

        await process({
          agent,
          log,
          options,
        });
      } catch (err) {
        console.error(err);
      }
    });
  });
};

export default createTransport;
