import { createCluster } from 'redis';

const Cluster = createCluster({
  url: process.env.REDIS_URL
});

Cluster.on('error', (err) => console.error('Redis Cluster Error:', err));

export default async function insertpenghunidb(
  nama, tempatlahir, tgllahir, noktp, nohp,
  tower, unit, status, periodsewa,
  agen, emergencyhp, pemilikunit
) {
  try {
    if (!Cluster.isOpen) {
      await Cluster.connect();
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

    const result = await Cluster.json.set(key, '$', penghuniData);

    return result === null ? "failed to insert penghuni" : "1inserted";

  } catch (err) {
    console.error("Redis Insert Error:", err);
    return "insert error";
  } finally {
    await Cluster.quit();
  }
}
