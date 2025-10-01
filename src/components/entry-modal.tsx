'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate, formatTime } from '../lib/utils';
import type { JournalEntry } from '../lib/types';

interface EntryModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}

export function EntryModal({ entry, isOpen, onClose, onEdit, onDelete }: EntryModalProps) {
  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-6">
            <span>{formatDate(entry.createdAt)}</span>
            <span className="text-sm font-normal text-muted-foreground">
              {formatTime(entry.createdAt)}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] custom-scrollbar">
          <div className="pr-4">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {entry.content}
            </div>

            <div className="mt-6 pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>{entry.content.split(' ').length} words</span>
                <span>
                  Created {formatDate(entry.createdAt)} at {formatTime(entry.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="px-3 py-1 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onEdit(entry)}
          >
            Edit in Editor
          </button>
          <button
            className="px-3 py-1 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              if (window.confirm('Delete this entry?')) {
                onDelete(entry.id);
              }
            }}
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
