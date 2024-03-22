import build from "pino-abstract-transport";
import https from "https";
import axios from "axios";

enum pinoLevelType {
  "TRACE" = "TRACE",
  "DEBUG" = "DEBUG",
  "INFO" = "INFO",
  "WARN" = "WARN",
  "ERROR" = "ERROR",
  "FATAL" = "FATAL",
  "OTHERS" = "OTHERS",
}

interface discordOptions {
  /**
   * Colors of embers
   */
  colors?: {
    /**
     * @default 0x808080
     */
    [pinoLevelType.TRACE]: number;
    /**
     * @default 0x008000
     */
    [pinoLevelType.DEBUG]: number;
    /**
     * @default 0x00bfff
     */
    [pinoLevelType.INFO]: number;
    /**
     * @default 0xffa500
     */
    [pinoLevelType.WARN]: number;
    /**
     * @default 0xff4500
     */
    [pinoLevelType.ERROR]: number;
    /**
     * @default 0xff0000
     */
    [pinoLevelType.FATAL]: number;
    /**
     * @default 0x440f3c
     */
    [pinoLevelType.OTHERS]: number;
  };
}

export interface options extends discordOptions {
  /**
   * Urls webhooks
   */
  webhooks: string[];
  /**
   * Specific keywords in the log message and stop them from being sent
   */
  filterMsgByKeyword?: string[];
  /**
   *  Exclude some tags from being sent
   */
  removeTags?: string[];
}

interface innerLog {
  level: number;
  time: string;
  pid: number;
  hostname: string;
  msg: string;
}

interface outLog extends innerLog {
  type: pinoLevelType;
}
interface DiscordEmbedFields {
  name: string;
  value: number | string;
}

const sendDiscord = async (
  url: string,
  agent: https.Agent,
  log: Record<string,string|number>,
  option: options
): Promise<void> => {
  const fields: DiscordEmbedFields[] = [];
  if(!option.filterMsgByKeyword){
    option.filterMsgByKeyword = [];
  }
  if(!option.removeTags){
    option.removeTags = [];
  }
  

  //Format

  for (const key in log) {
    if (key !== "type") {
      if (option.removeTags?.includes(key)) {
        delete log[key];
      } else {
        for(const keyword of option.filterMsgByKeyword){
          if(log[key] === keyword || (typeof log[key] === "string" && (log[key] as string).includes(keyword))){
            delete log[key];
          }
        }
        option.filterMsgByKeyword?.forEach((keyword) => {
        });
      }
    }
  }
  for (const key in log) {
    fields.push({
      name: key,
      value: log[key],
    });
  }

  if (!option.colors) {
    option.colors = {
      TRACE: 0x808080,
      DEBUG: 0x008000,
      INFO: 0x00bfff,
      WARN: 0xffa500,
      ERROR: 0xff4500,
      FATAL: 0xff0000,
      OTHERS: 0x440f3c,
    };
  }
  fields.push({ name: "raw", value: JSON.stringify(log) });
  //@ts-ignore
  const color = option.colors[log.type];
  

  const payload = {
    type: 1,
    embeds: [
      {
        title: `[${log.type}]`,
        color: color,
        fields: fields,
      },
    ],
  };
  axios({ httpAgent: agent, method: "POST", url: url, data: payload })
    .then((response) => {
      if (![200, 204].includes(response.status)) {
        console.error(
          `Failed to send log to webhook. Status: ${response.status}`
        );
      }
    })
    .catch((error) => {
      console.error("Error during webhook request:", error);
    });
};

export const createTransport = (options: options) => {
  return build(async function (source) {
    const Promises: Promise<void>[] = [];
    const dateTime = new Date().toLocaleString();
    const agent = new https.Agent({
      keepAlive: true,
    });

    source.forEach(async (log: innerLog) => {
      options.webhooks.forEach(async (url: string) => {
        const type = pinoLevelType.FATAL;
        if (url.includes("discord")) {
          Promises.push(
            sendDiscord(
              url,
              agent,
              { ...log, time: dateTime, type: type },
              options
            )
          );
        }
      });
    });
    await Promise.all(Promises);
  });
};
