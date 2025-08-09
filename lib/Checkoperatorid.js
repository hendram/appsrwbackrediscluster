import { createCluster } from 'redis';

const Cluster = createCluster({ url: process.env.REDIS_URL });

Cluster.on('error', (err) => console.error('Redis Cluster Error:', err));

export default async function checkoperatorid(id) {
  try {
    if (!Cluster.isOpen) await Cluster.connect();

    const key = `operator:${id}`;
    const record = await Cluster.json.get(key);

    return record?.operatorname || 'notfind';

  } catch (err) {
    console.error("Redis Error:", err);
    return 'error';
  } finally {
    await Cluster.quit();
  }
}
