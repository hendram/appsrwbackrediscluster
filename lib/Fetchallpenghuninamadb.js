import Redis from 'ioredis';
import _ from 'underscore';
import { cluster } from './redisclient.js';  

export default async function fetchallpenghuninamadb(operatorname, nama, lowlimit = 0, highlimit = 10) {
 
  try {
    // Ensure index exists
    try {
      await cluster.call('FT.INFO', 'penghuniIdx');
    } catch (err) {
      await cluster.call(
        'FT.CREATE', 'penghuniIdx',
        'ON', 'JSON',
        'PREFIX', '1', 'penghuni:',
        'SCHEMA',
        '$.nama', 'AS', 'nama', 'TEXT', 'SORTABLE',
        '$.tower', 'AS', 'tower', 'TAG',
        '$.unit', 'AS', 'unit', 'TAG'
      );
      console.log('Index created');
    }

    // Perform search
    const searchQuery = `@nama:"${nama}"`;
    const searchResult = await cluster.call(
      'FT.SEARCH', 'penghuniIdx', searchQuery,
      'RETURN', '1', '$',
      'SORTBY', 'nama', 'ASC',
      'LIMIT', lowlimit.toString(), highlimit.toString(),
      'DIALECT', '3'
    );

    // RediSearch response parsing
    // searchResult[0] is total count, then pairs of [key, {value}]
    const total = searchResult[0];
    if (total === 0) {
      console.log(`No documents found for nama=${nama}`);
      return null;
    }

    const docs = [];
    for (let i = 1; i < searchResult.length; i += 2) {
      const jsonStr = searchResult[i + 1]['$'];
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        docs.push(_.pick(parsed, [
          'nama',
          'tempatlahir',
          'tgllahir',
          'noktp',
          'nohp',
          'tower',
          'unit',
          'status',
          'periodsewa',
          'agen',
          'emergencyhp',
          'pemilikunit'
        ]));
      }
    }

    // Log search stats in RedisTimeSeries
    const searchtype = 'nama';
    const key = `searchlog:${operatorname}:${searchtype}`;
    const exists = await cluster.exists(key);

    if (!exists) {
      await cluster.call(
        'TS.CREATE', key,
        'RETENTION', '604800000',
        'LABELS', 'user', operatorname, 'filter', searchtype, 'metric', 'hits'
      );
    }
    await cluster.call('TS.ADD', key, '*', docs.length.toString());

    console.log(docs);
    return docs;

  } catch (err) {
    console.error(`Error fetching penghuni by nama: ${err.message}`);
    throw err;
  } finally {
  }
}
