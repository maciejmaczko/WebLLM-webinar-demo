import type { LLMProvider } from '../llm/types';

export class MockLLMProvider implements LLMProvider {
  private isInitialized = false;

  /**
   * Simulate preparing the mock provider. Should only be invoked once for the
   * lifetime of the instance; subsequent calls will throw an error.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('MockLLMProvider: already initialized');
    }

    // Simulate initialization delay
    console.log('MockLLMProvider: initializing ...');
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.isInitialized = true;
    console.log('MockLLMProvider: initialized');
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Mock LLM not initialized');
    }

    // Simulate processing delay
    console.log('MockLLMProvider: generating text for prompt', prompt);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return a contextual mock response
    if (prompt.toLowerCase().includes('reflect')) {
      return 'Take a moment to think about what went well today and what you learned from any challenges you faced.';
    }

    if (prompt.toLowerCase().includes('grateful')) {
      return 'Consider the small moments that brought you joy today, even if they seemed insignificant at the time.';
    }

    const reply = `Here's a thoughtful response to help you reflect on: "${prompt}". This mock response demonstrates how the AI assistant will provide personalized guidance.`;
    console.log('MockLLMProvider: reply', reply);
    return reply;
  }

  async generateSuggestion(context: string): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Mock LLM not initialized');
    }

    // Simulate processing delay
    console.log('MockLLMProvider: generating suggestion for context', context);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generate a simple dynamic suggestion from the provided context
    const snippet = context.split(/[.!?]/)[0]?.trim() || 'your journal entry';
    const suggestion = `Reflect on how "${snippet}" affected you today.`;
    console.log('MockLLMProvider: suggestion', suggestion);
    return suggestion;
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}
