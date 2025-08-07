import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

export default async function deletepenghunidb(
  nama, tempatlahir, tgllahir, noktp, nohp,
  tower, unit, status, periodsewa,
  agen, emergencyhp, pemilikunit
) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const pattern = 'penghuni:*';
    const iterator = client.scanIterator({ MATCH: pattern });

    for await (const key of iterator) {
      const record = await client.json.get(key);
      if (!record) continue;

      const isMatch =
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
        record.pemilikunit === pemilikunit;

      if (isMatch) {
        await client.del(key);
        return '1deleted';
      }
    }

    return 'failed to delete penghuni';
  } catch (err) {
    console.error('Redis Error:', err);
    return 'error';
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
}
