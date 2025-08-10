import Redis from 'ioredis';
import { cluster } from './redisclient.js';  


export default async function insertpenghunidb(
  nama, tempatlahir, tgllahir, noktp, nohp,
  tower, unit, status, periodsewa,
  agen, emergencyhp, pemilikunit
) {
  try {
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

    // ioredis doesn't have direct .json.set — use raw RedisJSON command via cluster.call
    // Format: JSON.SET key path json-string
    const result = await cluster.call('JSON.SET', key, '$', JSON.stringify(penghuniData));

    return result === 'OK' ? "1inserted" : "failed to insert penghuni";

  } catch (err) {
    console.error("Redis Insert Error:", err);
    return "insert error";
  } finally {
    if (cluster.status === 'ready') {
      await cluster.quit();
    }
  }
}
