import { createCluster } from 'redis';

const Cluster = createCluster({
  url: process.env.REDIS_URL
});

Cluster.on('error', (err) => console.error('Redis Cluster Error:', err));

export default async function checkoperatorsignindb(operatorname, password) {
  try {
    if (!Cluster.isOpen) {
      await Cluster.connect();
    }

    const key = `operator:${operatorname}`;
    const record = await Cluster.json.get(key);

    if (record === null) {
      return "notfind";
    }

    if (record.password === password) {
      return record;
    } else {
      return "notfind"; // wrong password
    }

  } catch (err) {
    console.error("Redis Error:", err);
    return "error";
  } finally {
    await Cluster.quit();
  }
}
