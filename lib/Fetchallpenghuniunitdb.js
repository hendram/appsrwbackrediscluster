import Redis from 'ioredis';
import _ from 'underscore';
import { cluster } from './redisclient.js';  


export default async function fetchallpenghuniunitdb(operatorname, tower, unit, lowlimit = 0, highlimit = 10) {
  try {
    // Same function body as before, using cluster.call() etc.

    try {
      await cluster.call('FT.INFO', 'penghuniIdx');
    } catch (err) {
      if (err.message.includes('Unknown Index')) {
        console.log('Index not found, creating...');
        await cluster.call('FT.CREATE', 'penghuniIdx',
          'ON', 'JSON',
          'PREFIX', '1', 'penghuni:',
          'SCHEMA',
          '$.nama', 'AS', 'nama', 'TEXT', 'SORTABLE',
          '$.tower', 'AS', 'tower', 'TAG',
          '$.unit', 'AS', 'unit', 'TAG'
        );
        console.log('Index created');
      } else {
        throw err;
      }
    }

    const escapedUnit = unit.replace(/-/g, '\\-');
    const query = `@tower:{${tower}} @unit:{${escapedUnit}}`;

    const searchResult = await cluster.call(
      'FT.SEARCH', 'penghuniIdx',
      query,
      'SORTBY', 'tower', 'ASC',
      'LIMIT', lowlimit.toString(), highlimit.toString(),
      'RETURN', '12',
      'nama', 'tempatlahir', 'tgllahir', 'noktp', 'nohp',
      'tower', 'unit', 'status', 'periodsewa', 'agen',
      'emergencyhp', 'pemilikunit'
    );

    const total = searchResult[0];
    if (total === 0) {
      console.log(`No documents found for tower=${tower}, unit=${unit}`);
      return null;
    }

    const docs = [];
    for (let i = 1; i < searchResult.length; i += 2) {
      const valuesArray = searchResult[i + 1];
      const obj = {};
      for (let j = 0; j < valuesArray.length; j += 2) {
        obj[valuesArray[j]] = valuesArray[j + 1];
      }
      docs.push(_.pick(obj, [
        'nama', 'tempatlahir', 'tgllahir', 'noktp', 'nohp',
        'tower', 'unit', 'status', 'periodsewa', 'agen',
        'emergencyhp', 'pemilikunit'
      ]));
    }

    const searchtype = 'unit';
    const key = `searchlog:${operatorname}:${searchtype}`;
    const hits = docs.length;

    const exists = await cluster.exists(key);
    if (!exists) {
      await cluster.call('TS.CREATE', key,
        'RETENTION', '604800000',
        'LABELS',
        'user', operatorname,
        'filter', searchtype,
        'metric', 'hits'
      );
    }
    await cluster.call('TS.ADD', key, '*', hits.toString());

    console.log(`Found ${docs.length} documents for tower=${tower}, unit=${unit}`);

    return docs;

  } catch (error) {
    console.error(`Error fetching penghuni by tower/unit: ${error.message}`);
    throw error;
  } finally {
    if (cluster.status === 'ready') {
    }
  }
}

