"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sheets = void 0;
const googleapis_1 = require("googleapis");
const config_json_1 = require("../../config.json");
const logger_1 = require("../util/logger");
class SheetsService {
    constructor() {
        this.auth = new googleapis_1.google.auth.GoogleAuth({
            keyFile: 'key.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        });
        this.spreadsheetId = config_json_1.serviceConfig.sheetId;
        void this.initInstance();
    }
    async initInstance() {
        const authClientObject = await this.auth.getClient();
        this.googleSheetsInstance = googleapis_1.google.sheets({ version: 'v4', auth: authClientObject });
        (0, logger_1.loginfo)('Sheets Instance Created.');
    }
    async read(range) {
        const readData = await this.googleSheetsInstance.spreadsheets.values.get({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: range,
        });
        (0, logger_1.loginfo)(`Sheets - Read ${range} - Response: ${readData.status}`);
        return readData;
    }
    async write(range, values) {
        const readData = await this.googleSheetsInstance.spreadsheets.values.update({
            auth: this.auth,
            spreadsheetId: this.spreadsheetId,
            range: range,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: values,
            }
        });
        (0, logger_1.loginfo)(`Sheets - Write ${range} - Response: ${readData.status}`);
        return readData;
    }
}
exports.sheets = new SheetsService();
//# sourceMappingURL=sheets.js.map