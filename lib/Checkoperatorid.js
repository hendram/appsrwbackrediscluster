import Redis from 'ioredis';
import { cluster } from './redisclient.js';  


export default async function checkoperatorid(id) {
 
  try {
    const key = `operator:${id}`;

    // If RedisJSON is enabled
    const record = await cluster.call('JSON.GET', key, '.');
    const parsed = record ? JSON.parse(record) : null;

    return parsed?.operatorname || 'notfind';

  } catch (err) {
    console.error("Redis Error:", err);
    return 'error';
  } finally {
  }
}
