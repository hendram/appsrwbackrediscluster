import { createCluster } from 'redis';

async function* scanClusterKeys(cluster, pattern) {
  const nodes = cluster.nodes('master'); // get all master nodes
  for (const node of nodes) {
    let cursor = '0';
    do {
      const [nextCursor, keys] = await node.scan(cursor, { MATCH: pattern, COUNT: 100 });
      cursor = nextCursor;
      for (const key of keys) {
        yield key;
      }
    } while (cursor !== '0');
  }
}


const rawNodes = process.env.REDIS_URL; 

if (!rawNodes) {
  throw new Error('REDIS_URL env var not set');
}

const rootNodes = rawNodes.split(',').map(addr => {
  const [host, port] = addr.trim().split(':');
  return { url: `redis://${host}:${port}` };
});

const Cluster = createCluster({ rootNodes });


Cluster.on('error', (err) => console.error('Redis Cluster Error', err));



export default async function checkoperatordb(operatorname, invitecode) {
  try {
    if (!Cluster.isOpen) {
      await Cluster.connect();
    }
    const pattern = 'operator:*';
    for await (const key of scanClusterKeys(Cluster, pattern)) {
          const record = await Cluster.json.get(key);
      if (record && record.operatorname === operatorname && record.invitecode === invitecode) {
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
