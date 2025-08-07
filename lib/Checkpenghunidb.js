import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

export default async function checkpenghunidb(
  nama, tempatlahir, tgllahir, noktp, nohp,
  tower, unit, status, periodsewa, agen,
  emergencyhp, pemilikunit
) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const pattern = 'penghuni:*';
    const iterator = client.scanIterator({ MATCH: pattern });

    for await (const key of iterator) {
      const record = await client.json.get(key);

      if (
        record &&
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

    return 'notfind';

  } catch (err) {
    console.error("Redis Error:", err);
    return 'error';
  } finally {
    await client.quit();
  }
}
