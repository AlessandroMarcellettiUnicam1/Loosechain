const DATABASE_NAME = 'loosechain-diagrams';
const DATABASE_VERSION = 1;
const DIAGRAM_STORE = 'diagrams';

let databasePromise;

function openDatabase() {
  if (!window.indexedDB) {
    return Promise.reject(new Error('This browser does not support local diagram storage.'));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      let settled = false;
      const fail = error => {
        if (!settled) {
          settled = true;
          databasePromise = null;
          reject(error);
        }
      };
      const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.onupgradeneeded = () => {
        request.result.createObjectStore(DIAGRAM_STORE, {
          keyPath: 'id',
          autoIncrement: true
        });
      };
      request.onsuccess = () => {
        const database = request.result;
        if (settled) {
          database.close();
          return;
        }
        settled = true;
        database.onversionchange = () => {
          database.close();
          databasePromise = null;
        };
        resolve(database);
      };
      request.onerror = () => fail(request.error || new Error('Could not open local diagram storage.'));
      request.onblocked = () => fail(new Error('Local diagram storage is blocked by another open tab.'));
    });
  }

  return databasePromise;
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Local diagram storage request failed.'));
  });
}

function transactionComplete(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onabort = () => reject(transaction.error || new Error('Local diagram storage transaction was aborted.'));
    transaction.onerror = () => reject(transaction.error || new Error('Local diagram storage transaction failed.'));
  });
}

async function runRequest(mode, operation) {
  const database = await openDatabase();
  const transaction = database.transaction(DIAGRAM_STORE, mode);
  const complete = transactionComplete(transaction);
  const result = requestResult(operation(transaction.objectStore(DIAGRAM_STORE)));
  const [value] = await Promise.all([result, complete]);
  return value;
}

export async function saveDiagram(name, xml) {
  return runRequest('readwrite', store => store.add({
    name,
    xml,
    updatedAt: new Date().toISOString()
  }));
}

export async function getDiagrams() {
  const diagrams = await runRequest('readonly', store => store.getAll());
  return diagrams.sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
}

export async function getDiagram(id) {
  return runRequest('readonly', store => store.get(id));
}
