import build from 'pino-abstract-transport';
import fetch from 'node-fetch';
import https from 'https';

const titles = {
  "10" : "Trace",
  "20" : "Debug",
  "30" : "Info",
  "40" : "Warn",
  "50" : "Error",
  "60" : "Fatal",
}
const colors  = {
  "10" : 0x808080,
  "20" : 0x008000,
  "30" : 0x00BFFF,
  "40" : 0xFFA500,
  "50" : 0xFF4500,
  "60" : 0xFF0000,
}

const process = async ({
  agent,
  log,
  options: { webhookUrl, webhookType = 1 },
}) => {
  try{
  const color = colors[log.level];
  const title = titles[log.level];
    const payload = {
      type: webhookType,
      embeds:[
        {
          "title": `${title}`,
          "color": `${color}`,
          "description": `${JSON.stringify(log)}` 
        }
      ]
    };
    console.log('até aqui foi caraio');
    console.log([color,title]);

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
