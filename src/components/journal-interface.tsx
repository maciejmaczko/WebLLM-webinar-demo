'use client';

import { useState } from 'react';
import { JournalEditor } from './journal-editor';
import { EntryList } from './entry-list';
import { AssistantClippy } from './assistant-clippy';
import { EntryModal } from './entry-modal';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { useJournalEntries } from '../hooks/use-journal-entries';
import type { JournalEntry } from '../lib/types';

// Number of typed characters required before the assistant appears.
// Suggestions are only shown when the entry contains more than 25 words.
const ASSISTANT_TRIGGER_CHARS = 20;

export function JournalInterface() {
  const { entries, currentEntry, updateCurrentEntry, saveEntry, deleteEntry } = useJournalEntries();
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    updateCurrentEntry(entry.content);
    deleteEntry(entry.id);
    handleCloseModal();
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    handleCloseModal();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Private Journaling Assistant</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
          {/* Left Column - Editor */}
          <div className="flex flex-col space-y-4">
            <JournalEditor value={currentEntry} onChange={updateCurrentEntry} />
            <div className="flex space-x-2">
              <Button onClick={saveEntry} className="self-start">
                New Entry
              </Button>
            </div>
          </div>

          {/* Right Column - Entries */}
          <div className="flex flex-col">
            <EntryList entries={entries} onEntryClick={handleEntryClick} />
          </div>
        </div>
      </main>

      {/* Assistant */}
      <AssistantClippy context={currentEntry} triggerAfterChars={ASSISTANT_TRIGGER_CHARS} />

      {/* Entry Modal */}
      <EntryModal
        entry={selectedEntry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditEntry}
        onDelete={handleDeleteEntry}
      />
    </div>
  );
}
