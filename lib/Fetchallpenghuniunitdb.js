import { createClient } from 'redis';
import _ from 'underscore';

const client = createClient({
  url: process.env.REDIS_URL
});

export default async function fetchallpenghuniunitdb(operatorname, tower, unit, lowlimit, highlimit) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

    const escapedUnit = unit.replace(/-/g, '\\-');
    const query = `@tower:{${tower}} @unit:{${escapedUnit}}`;

    const result = await client.ft.search('penghuniIdx', query, {
      SORTBY: {
        BY: 'tower',
        DIRECTION: 'ASC'
      },
      LIMIT: {
        from: lowlimit,
        size: highlimit
      }
    });


const searchtype = 'unit'; // or any other relevant filter name
const key = `searchlog:${operatorname}:${searchtype}`;
const hits = result.documents.length;

const exists = await client.exists(key);
if (!exists) {
  await client.ts.create(key, {
    RETENTION: 604800000,
    LABELS: {
      user: operatorname,
      filter: searchtype,
      metric: 'hits'
    }
  });
}

await client.ts.add(key, '*', hits);  

    if (result.total > 0) {
      const docs = result.documents.map(doc => {
   const data = doc.value; // Access the actual object
  return _.pick(data, [
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
  ]);
      });

      console.log(`Found ${docs.length} documents for tower=${tower}, unit=${unit}`);
      return docs;
    } else {
      console.log(`No documents found for tower=${tower}, unit=${unit}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching penghuni by tower/unit: ${error.message}`);
    throw error;
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
}
