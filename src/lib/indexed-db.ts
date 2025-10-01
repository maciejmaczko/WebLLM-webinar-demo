'use client';

import type { JournalEntry } from './types';

const DB_NAME = 'journal-db';
const DB_VERSION = 1;
const ENTRY_STORE = 'entries';
const CURRENT_STORE = 'current-entry';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  const indexedDB = globalThis.indexedDB;
  if (!indexedDB) {
    throw new Error('IndexedDB is not available in this environment');
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(ENTRY_STORE)) {
          db.createObjectStore(ENTRY_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(CURRENT_STORE)) {
          db.createObjectStore(CURRENT_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };
    });
  }
  return dbPromise;
}

async function withTransaction<T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest,
  defaultValue: T,
): Promise<T> {
  if (!('indexedDB' in globalThis)) return defaultValue;
  const db = await openDB();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const req = operation(store) as IDBRequest<T>;
    req.onsuccess = () => {
      resolve((req.result as T) ?? defaultValue);
      db.close();
      dbPromise = null;
    };
    req.onerror = () => {
      db.close();
      dbPromise = null;
      reject(req.error);
    };
  });
}

export async function getAllEntries(): Promise<JournalEntry[]> {
  return withTransaction(ENTRY_STORE, 'readonly', (store) => store.getAll(), []);
}

export async function addEntry(entry: JournalEntry): Promise<void> {
  await withTransaction(ENTRY_STORE, 'readwrite', (store) => store.put(entry), undefined);
}

export async function deleteEntry(id: string): Promise<void> {
  await withTransaction(ENTRY_STORE, 'readwrite', (store) => store.delete(id), undefined);
}

export async function getCurrentEntry(): Promise<string | undefined> {
  return withTransaction(CURRENT_STORE, 'readonly', (store) => store.get('current'), undefined);
}

export async function setCurrentEntry(content: string): Promise<void> {
  await withTransaction(
    CURRENT_STORE,
    'readwrite',
    (store) => store.put(content, 'current'),
    undefined,
  );
}

export async function clearCurrentEntry(): Promise<void> {
  await withTransaction(CURRENT_STORE, 'readwrite', (store) => store.delete('current'), undefined);
}
