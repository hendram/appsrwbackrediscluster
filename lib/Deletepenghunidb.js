import Redis from 'ioredis';
import { cluster } from './redisclient.js';  

export default async function deletepenghunidb(
  nama, tempatlahir, tgllahir, noktp, nohp,
  tower, unit, status, periodsewa,
  agen, emergencyhp, pemilikunit
) {

  try {
    const pattern = 'penghuni:*';
    let cursor = '0';

    do {
      const [nextCursor, keys] = await cluster.scan(cursor, 'MATCH', pattern);
      cursor = nextCursor;

      for (const key of keys) {
        const record = await cluster.call('JSON.GET', key);
        if (!record) continue;

        const parsedRecord = JSON.parse(record);
        const isMatch =
          parsedRecord.nama === nama &&
          parsedRecord.tempatlahir === tempatlahir &&
          parsedRecord.tgllahir === tgllahir &&
          parsedRecord.noktp === noktp &&
          parsedRecord.nohp === nohp &&
          parsedRecord.tower === tower &&
          parsedRecord.unit === unit &&
          parsedRecord.status === status &&
          parsedRecord.periodsewa === periodsewa &&
          parsedRecord.agen === agen &&
          parsedRecord.emergencyhp === emergencyhp &&
          parsedRecord.pemilikunit === pemilikunit;

        if (isMatch) {
          await cluster.del(key);
          return '1deleted';
        }
      }
    } while (cursor !== '0');

    return 'failed to delete penghuni';
  } catch (err) {
    console.error('Redis Error:', err);
    return 'error';
  } finally {
  }
}
