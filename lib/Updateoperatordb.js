import { createCluster } from 'redis';

const Cluster = createCluster({
  url: process.env.REDIS_URL
});

export default async function updateoperatordb(id, operatorname, password, invitecode) {
  try {
    if (!Cluster.isOpen) {
      await Cluster.connect();
    }

    const key = `operator:${id}`;
    const record = await Cluster.json.get(key);
    
    if (
      record &&
      record.operatorname === operatorname &&
      record.invitecode === invitecode
    ) {

   
   await Cluster.json.set(key, '$.password', password);
 
      return '1updated';
    }

    return 'failedupdate';
  } catch (err) {
    console.error('Redis Error:', err);
    return 'error';
  } finally {
    if (Cluster.isOpen) {
      await Cluster.quit();
    }
  }
}
