import Redis from 'ioredis';
import { cluster } from './redisclient.js';  

export default async function checkpenghunidb(
  nama, tempatlahir, tgllahir, noktp, nohp,
  tower, unit, status, periodsewa, agen,
  emergencyhp, pemilikunit
) {

  try {
    const pattern = 'penghuni:*';
    let cursor = '0';

    do {
      const [nextCursor, keys] = await cluster.scan(cursor, 'MATCH', pattern);
      cursor = nextCursor;

      for (const key of keys) {
        const recordStr = await cluster.call('JSON.GET', key, '.');
        if (!recordStr) continue;

        const record = JSON.parse(recordStr);

        if (
          record.nama === nama &&
          record.tempatlahir === tempatlahir &&
          record.tgllahir === tgllahir &&
          record.noktp === noktp &&
          record.nohp === nohp &&
          record.tower === tower &&
          record.unit === unit &&
          record.status === status &&
          record.periodsewa === periodsewa &&
          record.agen === agen &&
          record.emergencyhp === emergencyhp &&
          record.pemilikunit === pemilikunit
        ) {
          return 'find';
        }
      }
    } while (cursor !== '0');

    return 'notfind';

  } catch (err) {
    console.error("Redis Error:", err);
    return 'error';
  } finally {
  }
}
