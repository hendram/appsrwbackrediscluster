import Redis from 'ioredis';
import { cluster } from './redisclient.js';  


async function* scanClusterKeys(pattern) {
  const masters = cluster.nodes('master');
  for (const node of masters) {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await node.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;
      for (const key of keys) yield key;
    } while (cursor !== '0');
  }
}

export default async function checkoperatordb(operatorname, invitecode) {
  try {
    for await (const key of scanClusterKeys('operator:*')) {
      const record = await cluster.call('JSON.GET', key);
      if (record) {
        const parsed = JSON.parse(record);
        if (parsed.operatorname === operatorname && parsed.invitecode === invitecode) {
          return parsed;
        }
      }
    }
    return 'notfind';
  } catch (err) {
    console.error('Redis Error:', err);
    return 'error';
  } finally {
  }
}
