/// <reference types="node" />
import * as fs from 'fs';
/** Promisified version of fs.close. */
export declare const close: typeof fs.close.__promisify__;
/** Promisified version of fs.open. */
export declare const open: typeof fs.open.__promisify__;
/** Promisified version of fs.read. */
export declare const read: typeof fs.read.__promisify__;
/** Promisified version of fs.stat. */
export declare const stat: typeof fs.stat.__promisify__;
/** Promisified version of fs.write. */
export declare const write: typeof fs.write.__promisify__;
/** Creates a date with no local timezone offset. `month` and `day` are 1-based. */
export declare function createDate(year: number, month: number, day: number): Date;
/** Parses an 8-character date string of the form 'YYYYMMDD' into a UTC Date object. */
export declare function parse8CharDate(s: string): Date;
/** Formats the given Date object as a string, in 8-character 'YYYYMMDD' format. `d` is assumed to be in UTC. */
export declare function format8CharDate(d: Date): string;
/** Formats the given Date object as a string, in 10-character 'DD-MM-YYYY' format. `d` is assumed to be in UTC. */
export declare function format10CharDate(d: Date): string;
/** Parses the given Visual FoxPro DateTime representation into a UTC Date object. */
export declare function parseVfpDateTime(dt: {
    julianDay: number;
    msSinceMidnight: number;
}): Date;
/** Formats the given Date object as a Visual FoxPro DateTime representation. `d` is assumed to be in UTC. */
export declare function formatVfpDateTime(d: Date): {
    julianDay: number;
    msSinceMidnight: number;
};
