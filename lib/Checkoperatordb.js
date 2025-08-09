import { createCluster } from 'redis';

const Cluster = createCluster({
  url: process.env.REDIS_URL
});

Cluster.on('error', (err) => console.error('Redis Cluster Error', err));
export default async function checkoperatordb(operatorname, invitecode) {
  try {
    if (!Cluster.isOpen) {
      await Cluster.connect();
    }
    const pattern = 'operator:*';
    const iterator = Cluster.scanIterator({ MATCH: pattern });
    for await (const key of iterator) {
      const record = await Cluster.json.get(key);
      if (
        record &&
        record.operatorname === operatorname &&
        record.invitecode === invitecode
      ) {
        return record;
      }
    }
    return 'notfind';
  } catch (err) {
    console.error("Redis Error:", err);
    return "error";
  } finally {
    await Cluster.quit();
  }
}
