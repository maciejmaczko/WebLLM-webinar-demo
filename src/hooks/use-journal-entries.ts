'use client';

import { useState, useEffect, useCallback } from 'react';
import type { JournalEntry } from '../lib/types';
import { generateUUID } from '../lib/utils';
import {
  getAllEntries,
  addEntry as addEntryToDB,
  deleteEntry as deleteEntryFromDB,
  getCurrentEntry as getCurrentEntryFromDB,
  setCurrentEntry as setCurrentEntryInDB,
  clearCurrentEntry,
} from '../lib/indexed-db';

export function useJournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load entries from IndexedDB on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (async () => {
        try {
          const storedEntries = await getAllEntries();
          setEntries(
            storedEntries.map((entry) => ({
              ...entry,
              createdAt: new Date(entry.createdAt),
              updatedAt: new Date(entry.updatedAt),
            })),
          );
          const storedCurrentEntry = await getCurrentEntryFromDB();
          if (storedCurrentEntry) {
            setCurrentEntry(storedCurrentEntry);
          }
        } catch (error) {
          console.error('Error loading journal entries:', error);
        } finally {
          setIsLoaded(true);
        }
      })();
    }
  }, []);

  // Save current entry to IndexedDB whenever it changes
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') {
      return;
    }

    (async () => {
      try {
        if (currentEntry) {
          await setCurrentEntryInDB(currentEntry);
        } else {
          await clearCurrentEntry();
        }
      } catch (error) {
        console.error('Error saving current entry:', error);
      }
    })();
  }, [currentEntry, isLoaded]);

  const updateCurrentEntry = useCallback((content: string) => {
    setCurrentEntry(content);
  }, []);

  const saveEntry = useCallback(async () => {
    if (currentEntry.trim()) {
      const newEntry: JournalEntry = {
        id: generateUUID(),
        content: currentEntry.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setEntries((prev) => [newEntry, ...prev]);
      setCurrentEntry('');

      if (typeof window !== 'undefined') {
        try {
          await addEntryToDB(newEntry);
          await clearCurrentEntry();
        } catch (error) {
          console.error('Error saving journal entry:', error);
        }
      }
    }
  }, [currentEntry]);

  const deleteEntry = useCallback(async (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));

    if (typeof window !== 'undefined') {
      try {
        await deleteEntryFromDB(id);
      } catch (error) {
        console.error('Error deleting journal entry:', error);
      }
    }
  }, []);

  return {
    entries,
    currentEntry,
    updateCurrentEntry,
    saveEntry,
    deleteEntry,
  };
}
