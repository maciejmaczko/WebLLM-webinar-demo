export interface LLMConfig {
  /** Identifier of the model to load via WebLLM */
  model: string;
  /** Optional temperature for completions */
  temperature?: number;
  /** Optional maximum tokens to generate */
  maxTokens?: number;
  /** Optional prompt template for suggestion generation */
  suggestionPrompt?: string;
}

export interface LLMProvider {
  /**
   * Prepare the provider for use. This should be called only once; additional
   * invocations may throw an error or be ignored depending on the
   * implementation.
   */
  initialize(): Promise<void>;
  generateText(prompt: string): Promise<string>;
  generateSuggestion(context: string): Promise<string>;
  isReady(): boolean;
}

export interface WebLLMConfig extends LLMConfig {
  /** Optional callback to track loading progress */
  initProgressCallback?: (p: unknown) => void;
}
