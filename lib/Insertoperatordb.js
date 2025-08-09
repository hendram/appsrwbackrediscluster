import { createCluster } from 'redis';

const Cluster = createCluster({
  url: process.env.REDIS_URL
});


Cluster.on('error', (err) => console.error('Redis Cluster Error:', err));

export default async function insertoperatordb(operatorname, invitecode) {
  try {
    if (!Cluster.isOpen) {
      await Cluster.connect();
    }

     const idKey = "countercount:id:counter";
    let _id = await Cluster.incr(idKey);

    if (_id === 1) {
      await Cluster.set(idKey, 2);
      _id = 2;
    }

    const key = `operator:${_id}`;  // Use ID as Redis key

    const operatorData = {
      _id,
      operatorname,
      password:"",         // still set blank, just like your MongoDB version
      invitecode
    };

    const result = await Cluster.json.set(key, '$', operatorData);

    return result === null ? "failed to insert operator" : "1inserted";

  } catch (err) {
    console.error("Redis Insert Error:", err);
    return "insert error";
  } finally {
    await Cluster.quit();
  }
}
