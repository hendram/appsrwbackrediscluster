import { createCluster } from 'redis';

const Cluster = createCluster({
  url: process.env.REDIS_URL
});

Cluster.on('error', (err) => console.error('Redis Cluster Error:', err));

export default async function deleteoperatordb(operatorname) {
  try {
    if (!Cluster.isOpen) {
      await Cluster.connect();
    }

    const key = `operator:${operatorname}`;
    const result = await Cluster.del(key);

    if (result === 1) {
      return "1deleted";
    } else {
      return "failed to delete penghuni";
    }

  } catch (err) {
    console.error("Redis Delete Error:", err);
    return "delete error";
  } finally {
    await Cluster.quit();
  }
}
