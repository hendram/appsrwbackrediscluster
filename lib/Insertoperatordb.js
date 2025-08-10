import Redis from 'ioredis';
import { cluster } from './redisclient.js';  


export default async function insertoperatordb(operatorname, invitecode) {

  try {
    const idKey = "countercount:id:counter";
    let _id = await cluster.incr(idKey);

    if (_id === 1) {
      await cluster.set(idKey, 2);
      _id = 2;
    }

    const key = `operator:${_id}`;

    const operatorData = {
      _id,
      operatorname,
      password: "",
      invitecode
    };

    // Store JSON as string since ioredis doesn't natively support ReJSON without module
    const result = await cluster.call('JSON.SET', key, '$', JSON.stringify(operatorData));

    return result !== 'OK' ? "failed to insert operator" : "1inserted";

  } catch (err) {
    console.error("Redis Insert Error:", err);
    return "insert error";
  } finally {
  }
}
