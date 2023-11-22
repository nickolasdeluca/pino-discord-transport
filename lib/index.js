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

export const createTransport = (options) => {
  const agent =
    options.keepAlive === true
      ? new https.Agent({ keepAlive: true })
      : undefined;

  return build(async (iterable) => {
    for await (const log of iterable) {
      try {
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
