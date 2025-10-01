'use client';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '../lib/utils';
import type { JournalEntry } from '../lib/types';

interface EntryListProps {
  entries: JournalEntry[];
  onEntryClick: (entry: JournalEntry) => void;
}

export function EntryList({ entries, onEntryClick }: EntryListProps) {
  const getPreview = (content: string): string => {
    const preview = content.trim().slice(0, 100);
    return preview.length < content.trim().length ? `${preview}...` : preview;
  };

  const getEmojiSummary = (content: string): string => {
    // Simple emoji mapping based on keywords
    const text = content.toLowerCase();
    if (text.includes('happy') || text.includes('joy') || text.includes('excited')) return '😊';
    if (text.includes('sad') || text.includes('down') || text.includes('upset')) return '😢';
    if (text.includes('angry') || text.includes('frustrated')) return '😤';
    if (text.includes('tired') || text.includes('exhausted')) return '😴';
    if (text.includes('work') || text.includes('meeting')) return '💼';
    if (text.includes('travel') || text.includes('trip')) return '✈️';
    if (text.includes('food') || text.includes('dinner')) return '🍽️';
    return '📝';
  };

  if (entries.length === 0) {
    return (
      <Card className="h-full p-6 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">No entries yet</p>
          <p className="text-sm">Start writing to see your journal entries here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Previous Entries</h2>
        <p className="text-sm text-muted-foreground">{entries.length} entries</p>
      </div>

      <ScrollArea className="h-[calc(100%-80px)] custom-scrollbar">
        <div className="p-4 space-y-3">
          {entries.map((entry) => (
            <Card
              key={entry.id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors border border-border/50"
              onClick={() => onEntryClick(entry)}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-sm font-medium text-foreground">
                  {formatDate(entry.createdAt)}
                </span>
                <span className="text-lg">{getEmojiSummary(entry.content)}</span>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-3">
                {getPreview(entry.content)}
              </p>

              <div className="mt-2 text-xs text-muted-foreground">
                {entry.content.split(' ').length} words
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
