let db: IDBDatabase; // instance of indexdb

const database = 'human';
const table = 'person';

export type FaceRecord = { id: number, name: string, descriptor: number[], image: ImageData };

// eslint-disable-next-line no-console
const log = (...msg) => console.log('indexdb', ...msg);

export async function open() {
  if (db) return true;
  return new Promise((resolve) => {
    const request: IDBOpenDBRequest = indexedDB.open(database, 1);
    request.onerror = (evt) => log('error:', evt);
    request.onupgradeneeded = (evt: IDBVersionChangeEvent) => { // create if doesnt exist
      log('create:', evt.target);
      db = (evt.target as IDBOpenDBRequest).result;
      db.createObjectStore(table, { keyPath: 'id', autoIncrement: true });
    };
    request.onsuccess = (evt) => { // open
      db = (evt.target as IDBOpenDBRequest).result as IDBDatabase;
      log('open:', db);
      resolve(true);
    };
  });
}

export async function load(): Promise<FaceRecord[]> {
  const faceDB: Array<FaceRecord> = [];
  if (!db) await open(); // open or create if not already done
  return new Promise((resolve) => {
    const cursor: IDBRequest = db.transaction([table], 'readwrite').objectStore(table).openCursor(null, 'next');
    cursor.onerror = (evt) => log('load error:', evt);
    cursor.onsuccess = (evt) => {
      if ((evt.target as IDBRequest).result) {
        faceDB.push((evt.target as IDBRequest).result.value);
        (evt.target as IDBRequest).result.continue();
      } else {
        resolve(faceDB);
      }
    };
  });
}

export async function count(): Promise<number> {
  if (!db) await open(); // open or create if not already done
  return new Promise((resolve) => {
    const store: IDBRequest = db.transaction([table], 'readwrite').objectStore(table).count();
    store.onerror = (evt) => log('count error:', evt);
    store.onsuccess = () => resolve(store.result);
  });
}

export async function save(faceRecord: FaceRecord) {
  if (!db) await open(); // open or create if not already done
  const newRecord = { name: faceRecord.name, descriptor: faceRecord.descriptor, image: faceRecord.image }; // omit id as its autoincrement
  db.transaction([table], 'readwrite').objectStore(table).put(newRecord);
  log('save:', newRecord);
}

export async function remove(faceRecord: FaceRecord) {
  if (!db) await open(); // open or create if not already done
  db.transaction([table], 'readwrite').objectStore(table).delete(faceRecord.id); // delete based on id
  log('delete:', faceRecord);
}
