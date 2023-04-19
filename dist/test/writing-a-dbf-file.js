"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const dbffile_1 = require("dbffile");
const fs_1 = require("fs");
const path = require("path");
const rimraf = require("rimraf");
describe('Writing a DBF file', () => {
    let tests = [
        {
            description: 'DBF with default encoding',
            filename: 'PYACFL.DBF',
            recordCount: 15,
            newFields: [{ name: 'NO', type: 'I', size: 4 }],
            newRecord: (record, i) => ({ ...record, NO: i }),
            firstRecord: { AFCLPD: 'W', AFHRPW: 2.92308, AFLVCL: 0.00, AFCRDA: new Date('1999-03-25'), AFPSDS: '', NO: 0 },
        },
        {
            description: 'DBF with non-default encoding',
            filename: 'WSPMST.DBF',
            options: { encoding: 'tis620' },
            recordCount: 100,
            newFields: [{ name: 'FIELD1', type: 'C', size: 20 }],
            newRecord: record => ({ ...record, FIELD1: 'ทดสอบ' }),
            firstRecord: { DISPNAME: 'รองเท้าบุรุษADDA 61S02-M1', GROUP: '5', LEVEL: 'N', FIELD1: 'ทดสอบ' },
        },
        {
            description: `DBF with an 'F' (float) field`,
            filename: 'dbase_03_fixed.dbf',
            recordCount: 14,
            newFields: [{ name: 'FLOAT1', type: 'F', size: 20, decimalPlaces: 3 }],
            newRecord: record => ({ ...record, FLOAT1: Math.ceil(record.Northing) / 1000 }),
            firstRecord: { Circular_D: '12', Condition: 'Good', Northing: 557904.898, FLOAT1: 5.57905e2 },
        },
        {
            description: `DBF with memo file (version 0x83)`,
            filename: 'dbase_83.dbf',
            recordCount: 0,
            newFields: [],
            newRecord: record => record,
            firstRecord: {},
            error: 'Writing to files with memo fields is not supported.',
        },
        {
            description: `DBF with memo file (version 0x8b)`,
            filename: 'dbase_8b.dbf',
            options: { fileVersion: 0x8b },
            recordCount: 0,
            newFields: [],
            newRecord: record => record,
            firstRecord: {},
            error: 'Writing to files with memo fields is not supported.',
        },
        {
            description: `VFP DBF with an 'T' (DateTime) field`,
            filename: 'vfp9_30.dbf',
            recordCount: 2,
            newFields: [],
            newRecord: record => record,
            firstRecord: {
                FIELD1: 'carlos manuel',
                FIELD2: new Date('2013-12-12'),
                FIELD3: new Date('2013-12-12 08:30:00 GMT'),
                FIELD4: 17000000000,
                FIELD5: 2500.55,
                FIELD6: true,
            },
        },
        {
            description: `VFP DBF with memo file (version 0x30)`,
            filename: 'vfp9_30_memo.dbf',
            options: { fileVersion: 0x30 },
            recordCount: 0,
            newFields: [],
            newRecord: record => record,
            firstRecord: {},
            error: 'Writing to files with memo fields is not supported.',
        },
        {
            description: `DBF with unsupported version`,
            filename: 'dbase_83.dbf',
            options: { fileVersion: 0x31 },
            recordCount: 0,
            newFields: [],
            newRecord: record => record,
            firstRecord: {},
            error: 'Invalid file version 49',
        },
        {
            description: `DBF with unsupported field type`,
            filename: 'dbase_31.dbf',
            options: { readMode: 'loose' },
            recordCount: 0,
            newFields: [],
            newRecord: record => record,
            firstRecord: {},
            error: `Type 'Y' is not supported`,
        },
        {
            description: `DBF with invalid field value (string type mismatch)`,
            filename: 'PYACFL.DBF',
            recordCount: 15,
            newFields: [],
            newRecord: record => ({ ...record, AFCLPD: 1234 }),
            firstRecord: {},
            error: `AFCLPD: expected a string`,
        },
        {
            description: `DBF with invalid field value (string too long)`,
            filename: 'PYACFL.DBF',
            recordCount: 15,
            newFields: [],
            newRecord: record => ({ ...record, AFCLPD: 'blah '.repeat(60) }),
            firstRecord: {},
            error: `AFCLPD: text is too long (maximum length is 255 chars)`,
        },
        {
            description: `DBF with invalid field value (number type mismatch)`,
            filename: 'PYACFL.DBF',
            recordCount: 15,
            newFields: [],
            newRecord: record => ({ ...record, AFHRPW: 'not a number' }),
            firstRecord: {},
            error: `AFHRPW: expected a number`,
        },
        {
            description: `DBF with invalid field value (date type mismatch)`,
            filename: 'PYACFL.DBF',
            recordCount: 15,
            newFields: [],
            newRecord: record => ({ ...record, AFCRDA: '1999-03-25' }),
            firstRecord: {},
            error: `AFCRDA: expected a date`,
        },
        {
            description: `DBF with invalid field value (boolean type mismatch)`,
            filename: 'vfp9_30.dbf',
            recordCount: 2,
            newFields: [],
            newRecord: record => ({ ...record, FIELD6: 0 }),
            firstRecord: {},
            error: `FIELD6: expected a boolean`,
        },
        {
            description: 'DBF with field values set to null',
            filename: 'PYACFL.DBF',
            recordCount: 15,
            newFields: [],
            newRecord: record => ({ ...record, AFCLPD: null, AFHRPW: null, AFCRDA: null }),
            firstRecord: { AFCLPD: '', AFHRPW: null, AFCRDA: null },
        },
        {
            description: `VPF DBF with field values set to null`,
            filename: 'vfp9_30.dbf',
            recordCount: 2,
            newFields: [],
            newRecord: record => ({ ...record, FIELD1: null, FIELD3: null, FIELD4: null, FIELD6: null }),
            firstRecord: { FIELD1: '', FIELD3: null, FIELD4: null, FIELD6: null },
        },
    ];
    rimraf.sync(path.join(__dirname, `./fixtures/*.out`));
    tests.forEach(test => {
        it(test.description, async () => {
            let expectedRecordCount = test.recordCount;
            let expectedFirstRecord = test.firstRecord;
            let expectedError = test.error;
            let dstDbf;
            let records;
            let srcPath = path.join(__dirname, `./fixtures/${test.filename}`);
            let dstPath = path.join(__dirname, `./fixtures/${test.filename}.out`);
            try {
                let srcDbf = await dbffile_1.DBFFile.open(srcPath, test.options);
                dstDbf = await dbffile_1.DBFFile.create(dstPath, srcDbf.fields.concat(test.newFields), test.options);
                records = await srcDbf.readRecords(100);
                await dstDbf.appendRecords(records.map(test.newRecord));
                dstDbf = await dbffile_1.DBFFile.open(dstPath, test.options);
                records = await dstDbf.readRecords(500);
            }
            catch (err) {
                chai_1.expect(err.message).equals(expectedError !== null && expectedError !== void 0 ? expectedError : '??????');
                return;
            }
            finally {
                await fs_1.promises.unlink(dstPath).catch(() => { });
            }
            chai_1.expect(dstDbf.recordCount, 'the record count should match').equals(expectedRecordCount);
            chai_1.expect(records[0], 'first record should match').to.deep.include(expectedFirstRecord);
            chai_1.expect(undefined).equals(expectedError);
        });
    });
});
//# sourceMappingURL=writing-a-dbf-file.js.map