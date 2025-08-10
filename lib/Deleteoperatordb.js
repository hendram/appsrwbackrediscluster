import Redis from 'ioredis';
import { cluster } from './redisclient.js';  

export default async function deleteoperatordb(operatorname) {

  try {
    const key = `operator:${operatorname}`;
    const result = await cluster.del(key);

    return result === 1 ? "1deleted" : "failed to delete penghuni";

  } catch (err) {
    console.error("Redis Delete Error:", err);
    return "delete error";
  } finally {
  }
}
