import Redis from 'ioredis';
import { cluster } from './redisclient.js';  

export default async function checkoperatorsignindb(operatorname, password) {

  try {
    const key = `operator:${operatorname}`;

    // RedisJSON GET
    const recordStr = await cluster.call('JSON.GET', key, '.');
    if (!recordStr) return 'notfind';

    const record = JSON.parse(recordStr);

    if (record.password === password) {
      return record;
    } else {
      return 'notfind'; // wrong password
    }

  } catch (err) {
    console.error("Redis Error:", err);
    return 'error';
  } finally {
  }
}
