import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL
});

export default async function updateoperatordb(id, operatorname, password, invitecode) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const key = `operator:${id}`;
    const record = await client.json.get(key);
    
    if (
      record &&
      record.operatorname === operatorname &&
      record.invitecode === invitecode
    ) {

   
   await client.json.set(key, '$.password', password);
 
      return '1updated';
    }

    return 'failedupdate';
  } catch (err) {
    console.error('Redis Error:', err);
    return 'error';
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
}
