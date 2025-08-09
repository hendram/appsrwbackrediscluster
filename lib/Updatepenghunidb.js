import { createCluster } from 'redis';

const Cluster = createCluster({
  url: process.env.REDIS_URL
});


export default async function updatepenghunidb(
  oldnama, oldtempatlahir, oldtgllahir, oldnoktp, oldnohp, oldtower, oldunit, 
  oldstatus, oldperiodsewa, oldagen, oldemergencyhp, oldpemilikunit,
  nama, tempatlahir, tgllahir, noktp, nohp, tower, unit, status, periodsewa,
  agen, emergencyhp, pemilikunit
) {
  try {
    if (!Cluster.isOpen) {
      await Cluster.connect();
    }

    const pattern = 'penghuni:*';
    const iterator = Cluster.scanIterator({ MATCH: pattern });

    for await (const key of iterator) {
      const record = await Cluster.json.get(key);

      const isMatch = record &&
        record.nama === oldnama &&
        record.tempatlahir === oldtempatlahir &&
        record.tgllahir === oldtgllahir &&
        record.noktp === oldnoktp &&
        record.nohp === oldnohp &&
        record.tower === oldtower &&
        record.unit === oldunit &&
        record.status === oldstatus &&   record.periodsewa === oldperiodsewa &&
        record.agen === oldagen &&
        record.emergencyhp === oldemergencyhp &&
        record.pemilikunit === oldpemilikunit;

      if (isMatch) {
        // Update the whole record
        const updatedData = {
          nama, tempatlahir, tgllahir, noktp, nohp, tower, unit, status, periodsewa,
          agen, emergencyhp, pemilikunit
        };

        await Cluster.json.set(key, '$', updatedData);
        return '1updated';
      }
    }

    return 'failedupdate';
  } catch (err) {
    console.error('Redis Error:', err);
    return 'error';
  } finally {
    if (Cluster.isOpen) {
      await Cluster.quit();
    }
  }
} 
