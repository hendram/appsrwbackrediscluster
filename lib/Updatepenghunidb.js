import Redis from 'ioredis';
import { cluster } from './redisclient.js';  


const rawNodes = process.env.REDIS_URL;

export default async function updatepenghunidb(
  oldnama, oldtempatlahir, oldtgllahir, oldnoktp, oldnohp, oldtower, oldunit,
  oldstatus, oldperiodsewa, oldagen, oldemergencyhp, oldpemilikunit,
  nama, tempatlahir, tgllahir, noktp, nohp, tower, unit, status, periodsewa,
  agen, emergencyhp, pemilikunit
) {
  try {
    const pattern = 'penghuni:*';
    const stream = cluster.scanStream({ match: pattern });

    for await (const keys of stream) {
      for (const key of keys) {
        const recordJson = await cluster.call('JSON.GET', key);
        if (!recordJson) continue;

        const record = JSON.parse(recordJson);

        const isMatch = record &&
          record.nama === oldnama &&
          record.tempatlahir === oldtempatlahir &&
          record.tgllahir === oldtgllahir &&
          record.noktp === oldnoktp &&
          record.nohp === oldnohp &&
          record.tower === oldtower &&
          record.unit === oldunit &&
          record.status === oldstatus &&
          record.periodsewa === oldperiodsewa &&
          record.agen === oldagen &&
          record.emergencyhp === oldemergencyhp &&
          record.pemilikunit === oldpemilikunit;

        if (isMatch) {
          const updatedData = {
            nama, tempatlahir, tgllahir, noktp, nohp, tower, unit, status, periodsewa,
            agen, emergencyhp, pemilikunit
          };

          await cluster.call('JSON.SET', key, '$', JSON.stringify(updatedData));
          return '1updated';
        }
      }
    }

    return 'failedupdate';
  } catch (err) {
    console.error('Redis Error:', err);
    return 'error';
  } finally {
    if (cluster.status === 'ready') {
    }
  }
}
