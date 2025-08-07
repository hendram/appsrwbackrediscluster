import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});


client.on('error', (err) => console.error('Redis Client Error:', err));

export default async function insertoperatordb(operatorname, invitecode) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

     const idKey = "countercount:id:counter";
    let _id = await client.incr(idKey);

    if (_id === 1) {
      await client.set(idKey, 2);
      _id = 2;
    }

    const key = `operator:${_id}`;  // Use ID as Redis key

    const operatorData = {
      _id,
      operatorname,
      password:"",         // still set blank, just like your MongoDB version
      invitecode
    };

    const result = await client.json.set(key, '$', operatorData);

    return result === null ? "failed to insert operator" : "1inserted";

  } catch (err) {
    console.error("Redis Insert Error:", err);
    return "insert error";
  } finally {
    await client.quit();
  }
}
