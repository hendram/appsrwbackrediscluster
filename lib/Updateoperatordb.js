import Redis from 'ioredis';
import { cluster } from './redisclient.js';  // import the shared cluster

export default async function updateoperatordb(id, operatorname, password, invitecode) {

  try {

    const key = `operator:${id}`;

    // Get full JSON object at key
    const recordJson = await cluster.call('JSON.GET', key);
    if (!recordJson) return 'failedupdate';

    const record = JSON.parse(recordJson);

    if (record.operatorname === operatorname && record.invitecode === invitecode) {
      // Set password field using JSON.SET
      const result = await cluster.call('JSON.SET', key, '$.password', JSON.stringify(password));
      return result === 'OK' ? '1updated' : 'failedupdate';
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
