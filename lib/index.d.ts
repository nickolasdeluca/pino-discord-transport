/// <reference types="node" />
import build from "pino-abstract-transport";
declare enum pinoLevelType {
    "TRACE" = "TRACE",
    "DEBUG" = "DEBUG",
    "INFO" = "INFO",
    "WARN" = "WARN",
    "ERROR" = "ERROR",
    "FATAL" = "FATAL",
    "OTHERS" = "OTHERS"
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
export declare const createTransport: (options: options) => import("stream").Transform & build.OnUnknown;
export {};
