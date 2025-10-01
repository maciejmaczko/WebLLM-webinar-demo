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
