export interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMResponse {
  text: string;
  confidence: number;
}

export interface AssistantSuggestion {
  id: string;
  text: string;
  category: 'reflection' | 'prompt' | 'question';
}
