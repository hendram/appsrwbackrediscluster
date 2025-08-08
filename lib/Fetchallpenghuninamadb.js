import { createClient } from 'redis';
import _ from 'underscore';

const client = createClient({
  url: process.env.REDIS_URL
});


export default async function fetchallpenghuninamadb(operatorname, nama, lowlimit = 0, highlimit = 10) {
  try {
    if (!client.isOpen) {
      await client.connect();
    }

 try {
    await client.call('FT.INFO', 'penghuniIdx');
    console.log('Index penghuniIdx exists');
  } catch (err) {
    if (err.message.includes('Unknown Index name')) {
      console.log('Creating index penghuniIdx...');
   await client.call(
  'FT.CREATE',
  'penghuniIdx',
  'ON',
  'JSON',
  'PREFIX', '1', 'penghuni:',
  'SCHEMA',
  '$.nama', 'AS', 'nama', 'TEXT', 'SORTABLE'
   );
   console.log('Index created');
    } else {
      throw err;
    }
  }



    const searchQuery = `@nama:"${nama}"`;

    const result = await client.ft.search('penghuniIdx', searchQuery, {
      RETURN: ['$'],
      DIALECT: 3,             // ✅ required for JSON search
      LIMIT: { from: lowlimit, size: highlimit },
      SORTBY: { BY: 'nama', DIRECTION: 'ASC' },
    });

    if (result.total === 0) {
      console.log(`No documents found for nama=${nama}`);
      return null;
    }

const searchtype = 'nama'; // or any other relevant filter name
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



const docs = result.documents.map(doc => {
  const data = doc.value[0]; // Access the actual object
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

console.log(docs);
return docs;


  } catch (error) {
    console.error(`Error fetching penghuni by nama: ${error.message}`);
    throw error;
  } finally {
    if (client.isOpen) {
      await client.quit();
    }
  }
}
