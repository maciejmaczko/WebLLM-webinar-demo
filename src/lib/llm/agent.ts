import type { LLMProvider } from './types';
import { MockLLMProvider } from '../mock/mock-llm-provider';

export interface AgentOptions {
  provider?: LLMProvider;
  /** Enable verbose console logging */
  verbose?: boolean;
}

export class LLMAgent {
  private provider: LLMProvider;
  private verbose: boolean;

  constructor(options: AgentOptions = {}) {
    this.verbose = options.verbose ?? false;

    if (options.provider) {
      if (this.verbose) {
        console.log('LLMAgent: using custom provider');
      }
      this.provider = options.provider;
    } else {
      if (this.verbose) {
        console.log('LLMAgent: using MockLLMProvider');
      }
      this.provider = new MockLLMProvider();
    }
  }

  async initialize(): Promise<void> {
    if (this.verbose) {
      console.log('LLMAgent: initializing provider ...');
    }
    await this.provider.initialize();
    if (this.verbose) {
      console.log('LLMAgent: provider initialized');
    }
  }

  async getSuggestion(context: string): Promise<string> {
    if (this.verbose) {
      console.log('LLMAgent: generating suggestion from context', context);
    }
    const suggestion = await this.provider.generateSuggestion(context);
    if (this.verbose) {
      console.log('LLMAgent: suggestion generated', suggestion);
    }
    return suggestion;
  }

  async generateReply(prompt: string): Promise<string> {
    if (this.verbose) {
      console.log('LLMAgent: generating reply for prompt', prompt);
    }
    const reply = await this.provider.generateText(prompt);
    if (this.verbose) {
      console.log('LLMAgent: reply generated', reply);
    }
    return reply;
  }

  isReady(): boolean {
    const ready = this.provider.isReady();
    if (this.verbose) {
      console.log('LLMAgent: provider ready', ready);
    }
    return ready;
  }
}

export function createDefaultAgent(): LLMAgent {
  return new LLMAgent();
}
