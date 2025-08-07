import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

export default async function checkoperatordb(operatorname, invitecode) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }
    
   console.log("checkfuck" + operatorname);

    const pattern = 'operator:*';
    const iterator = client.scanIterator({ MATCH: pattern });

    for await (const key of iterator) {
      const record = await client.json.get(key);

      console.log(record);

      if (
        record &&
        record.operatorname === operatorname &&
        record.invitecode === invitecode
      ) {
        return record;
      }
    }

    return 'notfind';

  } catch (err) {
    console.error("Redis Error:", err);
    return "error";
  } finally {
    await client.quit();
  }
}
