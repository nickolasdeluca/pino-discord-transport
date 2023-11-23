import build from 'pino-abstract-transport';
import fetch from 'node-fetch';
import https from 'https';

const process = async ({
  agent,
  log,
  options: { webhookUrl, webhookType = 1 },
}) => {
  try {
    const payload = {
      type: webhookType,
      content: `\`\`\`${JSON.stringify(log)}\`\`\``,
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
