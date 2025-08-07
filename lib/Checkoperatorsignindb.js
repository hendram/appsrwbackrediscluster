import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error:', err));

export default async function checkoperatorsignindb(operatorname, password) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const key = `operator:${operatorname}`;
    const record = await client.json.get(key);

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
    await client.quit();
  }
}
