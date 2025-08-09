import { createCluster } from 'redis';
import _ from 'underscore';

const Cluster = createCluster({
  url: process.env.REDIS_URL
});

export default async function fetchallpenghuniunitdb(operatorname, tower, unit, lowlimit, highlimit) {
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


    const escapedUnit = unit.replace(/-/g, '\\-');
    const query = `@tower:{${tower}} @unit:{${escapedUnit}}`;

    const result = await Cluster.ft.search('penghuniIdx', query, {
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
    if (Cluster.isOpen) {
      await Cluster.quit();
    }
  }
}
