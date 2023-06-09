"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatVfpDateTime = exports.parseVfpDateTime = exports.format10CharDate = exports.format8CharDate = exports.parse8CharDate = exports.createDate = exports.write = exports.stat = exports.read = exports.open = exports.close = void 0;
const fs = require("fs");
const util_1 = require("util");
/** Promisified version of fs.close. */
exports.close = util_1.promisify(fs.close);
/** Promisified version of fs.open. */
exports.open = util_1.promisify(fs.open);
/** Promisified version of fs.read. */
exports.read = util_1.promisify(fs.read);
/** Promisified version of fs.stat. */
exports.stat = util_1.promisify(fs.stat);
/** Promisified version of fs.write. */
exports.write = util_1.promisify(fs.write);
/** Creates a date with no local timezone offset. `month` and `day` are 1-based. */
function createDate(year, month, day) {
    const yyyy = String(year).padStart(4, '0');
    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return new Date(`${yyyy}-${mm}-${dd}`);
}
exports.createDate = createDate;
/** Parses an 8-character date string of the form 'YYYYMMDD' into a UTC Date object. */
function parse8CharDate(s) {
    return new Date(`${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`);
}
exports.parse8CharDate = parse8CharDate;
/** Formats the given Date object as a string, in 8-character 'YYYYMMDD' format. `d` is assumed to be in UTC. */
function format8CharDate(d) {
    return d.toISOString().slice(0, 10).replace(/-/g, '');
}
exports.format8CharDate = format8CharDate;
/** Formats the given Date object as a string, in 10-character 'DD-MM-YYYY' format. `d` is assumed to be in UTC. */
function format10CharDate(d) {
    let newDate = d.toISOString();
    return `${newDate.slice(8, 10)}-${newDate.slice(5, 7)}-${newDate.slice(0, 4)}`;
}
exports.format10CharDate = format10CharDate;
/** Parses the given Visual FoxPro DateTime representation into a UTC Date object. */
function parseVfpDateTime(dt) {
    // Compute year/month/day
    const s1 = dt.julianDay + 68569;
    const n = Math.floor(4 * s1 / 146097);
    const s2 = s1 - Math.floor(((146097 * n) + 3) / 4);
    const i = Math.floor(4000 * (s2 + 1) / 1461001);
    const s3 = s2 - Math.floor(1461 * i / 4) + 31;
    const q = Math.floor(80 * s3 / 2447);
    const s4 = Math.floor(q / 11);
    const year = (100 * (n - 49)) + i + s4;
    const month = q + 2 - (12 * s4);
    const day = s3 - Math.floor(2447 * q / 80);
    // Compute hour/minute/second
    const secsSinceMidnight = Math.floor(dt.msSinceMidnight / 1000);
    const minsSinceMidnight = Math.floor(secsSinceMidnight / 60);
    const second = secsSinceMidnight % 60;
    const minute = minsSinceMidnight % 60;
    const hour = Math.floor(minsSinceMidnight / 60);
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
}
exports.parseVfpDateTime = parseVfpDateTime;
/** Formats the given Date object as a Visual FoxPro DateTime representation. `d` is assumed to be in UTC. */
function formatVfpDateTime(d) {
    // Compute year/month/day
    const msPerDay = 86400000;
    const daysFromEpoch = Math.floor(d.getTime() / msPerDay);
    const julianDaysBeforeEpoch = 2440588;
    const julianDay = Math.floor(daysFromEpoch + julianDaysBeforeEpoch);
    // Compute milliseconds since midnight
    const hrs = d.getUTCHours();
    const mins = d.getUTCMinutes();
    const secs = d.getUTCSeconds();
    const msSinceMidnight = (((hrs * 60 + mins) * 60) + secs) * 1000;
    return { julianDay, msSinceMidnight };
}
exports.formatVfpDateTime = formatVfpDateTime;
//# sourceMappingURL=utils.js.map