import { createCluster } from 'redis';
import _ from 'underscore';

const Cluster = createCluster({
  url: process.env.REDIS_URL
});


export default async function fetchallpenghuninamadb(operatorname, nama, lowlimit = 0, highlimit = 10) {
  try {
    if (!Cluster.isOpen) {
      await Cluster.connect();
    }

try {
  await Cluster.ft.info('penghuniIdx');
} catch (err) {
  await Cluster.ft.create('penghuniIdx', {
    '$.nama': {
      type: 'TEXT',
      AS: 'nama',
      SORTABLE: true,
    },
    '$.tower': {
      type: 'TAG',
      AS: 'tower',
    },
    '$.unit': {
      type: 'TAG',
      AS: 'unit',
    }
  }, {
    ON: 'JSON',
    PREFIX: 'penghuni:',
  });

  console.log('Index created');
}

    const searchQuery = `@nama:"${nama}"`;

    const result = await Cluster.ft.search('penghuniIdx', searchQuery, {
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

const exists = await Cluster.exists(key);
if (!exists) {
  await Cluster.ts.create(key, {
    RETENTION: 604800000,
    LABELS: {
      user: operatorname,
      filter: searchtype,
      metric: 'hits'
    }
  });
}
 
await Cluster.ts.add(key, '*', hits);  



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
    if (Cluster.isOpen) {
      await Cluster.quit();
    }
  }
}
