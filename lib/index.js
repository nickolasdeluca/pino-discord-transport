import build from 'pino-abstract-transport';
import fetch from 'node-fetch';

const process = async ({
  agent,
  log,
  options: { webhookUrl, webhookType = 1 },
}) => {
  let payload = {
    type: webhookType,
    content: `\`\`\`${JSON.stringify(log)}\`\`\``,
  };

  await fetch(webhookUrl, {
    agent,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
};

const prepare = async (log, removeTags) => {
  if (removeTags) {
    for await (const tag of removeTags) {
      delete log[tag];
    }
  }

  if (log.time) {
    log.time = new Date(log.time).toLocaleString();
  }
};

export const createTransport = (options, removeTags) => {
  const agent =
    options.keepAlive === true
      ? new https.Agent({ keepAlive: true })
      : undefined;

  return build(async (iterable) => {
    for await (const log of iterable) {
      try {
        await prepare(log, removeTags);

        await process({
          agent,
          log,
          options,
        });
      } catch (err) {
        console.error(err);
      }
    }
  });
};

export default createTransport;
