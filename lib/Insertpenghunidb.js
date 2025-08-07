import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error:', err));

export default async function insertpenghunidb(
  nama, tempatlahir, tgllahir, noktp, nohp,
  tower, unit, status, periodsewa,
  agen, emergencyhp, pemilikunit
) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const key = `penghuni:${noktp}`; // using noktp as unique ID
    const penghuniData = {
      nama,
      tempatlahir,
      tgllahir,
      noktp,
      nohp,
      tower,
      unit,
      status,
      periodsewa,
      agen,
      emergencyhp,
      pemilikunit
    };

    const result = await client.json.set(key, '$', penghuniData);

    return result === null ? "failed to insert penghuni" : "1inserted";

  } catch (err) {
    console.error("Redis Insert Error:", err);
    return "insert error";
  } finally {
    await client.quit();
  }
}
