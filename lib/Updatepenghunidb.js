import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});


export default async function updatepenghunidb(
  oldnama, oldtempatlahir, oldtgllahir, oldnoktp, oldnohp, oldtower, oldunit, 
  oldstatus, oldperiodsewa, oldagen, oldemergencyhp, oldpemilikunit,
  nama, tempatlahir, tgllahir, noktp, nohp, tower, unit, status, periodsewa,
  agen, emergencyhp, pemilikunit
) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    // Use the direct key based on oldnoktp
    const key = `penghuni:${oldnoktp}`;

    const record = await client.json.get(key);

    // Check if record exists and matches all old fields (optional, can skip if key is unique)
    if (
      record &&
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
      record.pemilikunit === oldpemilikunit
    ) {
      // Prepare updated data object
      const updatedData = {
        nama, tempatlahir, tgllahir, noktp, nohp, tower, unit, status, periodsewa,
        agen, emergencyhp, pemilikunit
      };

      // Update the JSON document at the key
      await client.json.set(key, '$', updatedData);

      return '1updated';
    } else {
      return 'failedupdate';
    }

  } catch (err) {
    console.error('Redis Error:', err);
    return 'error';
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
}
