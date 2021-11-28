import fs from 'fs';
import { loginfo } from '../util/logger';

export let gachaData: GachaData;

export interface GachaData {
    [key: string]: GachaInfo
}

export interface GachaInfo {
    date: number;
    luckString: [string, string][],
    luckRate: number[],
    gachaRate: number,
    maxRoll: number,
    title: string,
    description: string,
    footer: string
}

export async function loadData() {
    loginfo('Start loading data.');
    const loaded = new Promise<void>((resolve, reject) => {
        fs.readFile('data/gacha.json', 'utf8', (err, data) => {
            if (err) reject(err);
            gachaData = JSON.parse(data as unknown as string) as GachaData;
            loginfo('Loaded gacha data.');
            resolve();
        });
    });
    return loaded;
}
