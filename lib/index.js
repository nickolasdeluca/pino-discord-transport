"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransport = void 0;
const pino_abstract_transport_1 = __importDefault(require("pino-abstract-transport"));
const https_1 = __importDefault(require("https"));
const axios_1 = __importDefault(require("axios"));
var pinoLevelType;
(function (pinoLevelType) {
    pinoLevelType["TRACE"] = "TRACE";
    pinoLevelType["DEBUG"] = "DEBUG";
    pinoLevelType["INFO"] = "INFO";
    pinoLevelType["WARN"] = "WARN";
    pinoLevelType["ERROR"] = "ERROR";
    pinoLevelType["FATAL"] = "FATAL";
    pinoLevelType["OTHERS"] = "OTHERS";
})(pinoLevelType || (pinoLevelType = {}));
const sendDiscord = (url, agent, log, option) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const fields = [];
    if (!option.filterMsgByKeyword) {
        option.filterMsgByKeyword = [];
    }
    if (!option.removeTags) {
        option.removeTags = [];
    }
    //Format
    for (const key in log) {
        if (key !== "type") {
            if ((_a = option.removeTags) === null || _a === void 0 ? void 0 : _a.includes(key)) {
                delete log[key];
            }
            else {
                for (const keyword of option.filterMsgByKeyword) {
                    if (log[key] === keyword || (typeof log[key] === "string" && log[key].includes(keyword))) {
                        delete log[key];
                    }
                }
                (_b = option.filterMsgByKeyword) === null || _b === void 0 ? void 0 : _b.forEach((keyword) => {
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
    (0, axios_1.default)({ httpAgent: agent, method: "POST", url: url, data: payload })
        .then((response) => {
        if (![200, 204].includes(response.status)) {
            console.error(`Failed to send log to webhook. Status: ${response.status}`);
        }
    })
        .catch((error) => {
        console.error("Error during webhook request:", error);
    });
});
const createTransport = (options) => {
    return (0, pino_abstract_transport_1.default)(function (source) {
        return __awaiter(this, void 0, void 0, function* () {
            const Promises = [];
            const dateTime = new Date().toLocaleString();
            const agent = new https_1.default.Agent({
                keepAlive: true,
            });
            source.forEach((log) => __awaiter(this, void 0, void 0, function* () {
                options.webhooks.forEach((url) => __awaiter(this, void 0, void 0, function* () {
                    const type = pinoLevelType.FATAL;
                    if (url.includes("discord")) {
                        Promises.push(sendDiscord(url, agent, Object.assign(Object.assign({}, log), { time: dateTime, type: type }), options));
                    }
                }));
            }));
            yield Promise.all(Promises);
        });
    });
};
exports.createTransport = createTransport;
