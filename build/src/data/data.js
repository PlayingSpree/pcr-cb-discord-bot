"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadData = exports.gachaData = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../util/logger");
async function loadData() {
    (0, logger_1.loginfo)('Start loading data.');
    const loaded = new Promise((resolve, reject) => {
        fs_1.default.readFile('data/gacha.json', 'utf8', (err, data) => {
            if (err)
                reject(err);
            exports.gachaData = JSON.parse(data);
            (0, logger_1.loginfo)('Loaded gacha data.');
            resolve();
        });
    });
    return loaded;
}
exports.loadData = loadData;
//# sourceMappingURL=data.js.map