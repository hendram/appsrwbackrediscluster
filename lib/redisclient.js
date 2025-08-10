import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config()

const rawNodes = process.env.REDIS_URL;
if (!rawNodes) throw new Error('REDIS_URL env var not set');

export const cluster = new Redis.Cluster(
  rawNodes.split(',').map(addr => {
    const [host, port] = addr.trim().split(':');
    return { host, port: Number(port) };
  })
);
