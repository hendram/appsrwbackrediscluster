import { createClient } from 'redis';

const client = createClient({ url: process.env.REDIS_URL });

client.on('error', (err) => console.error('Redis Client Error:', err));

export default async function checkoperatorid(id) {
  try {
    if (!client.isOpen) await client.connect();

    const key = `operator:${id}`;
    const record = await client.json.get(key);

    return record?.operatorname || 'notfind';

  } catch (err) {
    console.error("Redis Error:", err);
    return 'error';
  } finally {
    await client.quit();
  }
}
