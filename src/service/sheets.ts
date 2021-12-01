import { google, sheets_v4 } from 'googleapis';
import { serviceConfig } from '../../config.json';
import { logerror, loginfo } from '../util/logger';

class SheetsService {
    private auth;
    private googleSheetsInstance!: sheets_v4.Sheets;
    private spreadsheetId;

    constructor() {
        this.auth = new google.auth.GoogleAuth({
            keyFile: 'key.json',
            scopes: 'https://www.googleapis.com/auth/spreadsheets'
        });
        this.spreadsheetId = serviceConfig.sheetId;
        void this.initInstance();
    }

    async initInstance() {
        const authClientObject = await this.auth.getClient();
        this.googleSheetsInstance = google.sheets({ version: 'v4', auth: authClientObject });
        loginfo('Sheets Instance Created.');
    }

    async read(range: string) {
        try {
            const readData = await this.googleSheetsInstance.spreadsheets.values.get({
                auth: this.auth,
                spreadsheetId: this.spreadsheetId,
                range: range,
            });

            loginfo(`Sheets - Read ${range} - Response: ${readData.status}`);
            return readData.data.values;
        }
        catch (e) {
            logerror(`Sheets - Read ${range} - Error`);
            logerror(e);
            return [];
        }
    }

    async write(range: string, values: string[][]) {
        try {
            const readData = await this.googleSheetsInstance.spreadsheets.values.update({
                auth: this.auth,
                spreadsheetId: this.spreadsheetId,
                range: range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: values,
                }
            });

            loginfo(`Sheets - Write ${range} - Response: ${readData.status}`);
            return readData;
        }
        catch (e) {
            logerror(`Sheets - Write ${range} - Error`);
            logerror(e);
            return [];
        }
    }
}

export const sheets = new SheetsService();