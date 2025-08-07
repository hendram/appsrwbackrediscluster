import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error:', err));

export default async function deleteoperatordb(operatorname) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const key = `operator:${operatorname}`;
    const result = await client.del(key);

    if (result === 1) {
      return "1deleted";
    } else {
      return "failed to delete penghuni";
    }

  } catch (err) {
    console.error("Redis Delete Error:", err);
    return "delete error";
  } finally {
    await client.quit();
  }
}
