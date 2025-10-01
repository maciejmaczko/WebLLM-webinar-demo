import type { LLMProvider, WebLLMConfig } from './types';
import type { MLCEngineInterface } from '@mlc-ai/web-llm';
import type {
  ChatCompletionRequestNonStreaming,
  ChatCompletion,
} from '@mlc-ai/web-llm/lib/openai_api_protocols/index';
import { DEFAULT_SUGGESTION_PROMPT } from './prompts';

export class WebLLMProvider implements LLMProvider {
  private config: WebLLMConfig;
  private engine: MLCEngineInterface | null = null;
  private initializing: Promise<void> | null = null;

  constructor(config: WebLLMConfig) {
    this.config = config;
  }

  /**
   * Initialize the underlying WebLLM engine. This should only be called once
   * for the lifetime of the provider. Calling it again will throw an error.
   */
  async initialize(): Promise<void> {
    if (this.engine !== null) {
      throw new Error('WebLLMProvider: already initialized');
    }

    if (this.initializing) {
      return this.initializing;
    }

    console.log('WebLLMProvider: initializing engine with model', this.config.model);
    this.initializing = (async () => {
      try {
        const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
        this.engine = await CreateMLCEngine(this.config.model, {
          initProgressCallback: this.config.initProgressCallback,
        });
        console.log('WebLLMProvider: engine initialized');
      } catch (err) {
        console.error('WebLLMProvider: failed to initialize engine', err);
        this.engine = null;
        throw new Error('WebLLMProvider: failed to initialize engine', { cause: err });
      } finally {
        this.initializing = null;
      }
    })();

    return this.initializing;
  }

  private getEngine(): MLCEngineInterface {
    if (!this.engine) {
      throw new Error('WebLLM not initialized');
    }
    return this.engine;
  }

  async generateText(prompt: string): Promise<string> {
    const engine = this.getEngine();
    try {
      console.log('WebLLMProvider: generating text for prompt', prompt);
      const params: ChatCompletionRequestNonStreaming = {
        messages: [
          {
            role: 'system',
            content:
              'You are a thoughtful, privacy-respecting writing companion. Respond concisely.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: this.config.temperature ?? 0.7,
      };

      if (typeof this.config.maxTokens === 'number') {
        params.max_tokens = this.config.maxTokens;
      }

      const reply: ChatCompletion = await engine.chat.completions.create(params);

      if (!reply.choices || reply.choices.length === 0) {
        throw new Error('WebLLMProvider: no choices returned from model');
      }

      const content = reply.choices[0].message?.content;
      if (typeof content !== 'string') {
        throw new Error('WebLLMProvider: missing content in model reply');
      }

      console.log('WebLLMProvider: received reply', content);

      return content;
    } catch (err) {
      console.error('WebLLMProvider: failed to generate text', err);
      throw new Error('WebLLMProvider: failed to generate text', { cause: err });
    }
  }

  async generateSuggestion(context: string): Promise<string> {
    try {
      console.log('WebLLMProvider: generating suggestion for context', context);

      const suggestionPrompt = this.config.suggestionPrompt ?? DEFAULT_SUGGESTION_PROMPT;

      const text = await this.generateText(`${suggestionPrompt}\n\n<context>${context}</context>`);

      return text.trim();
    } catch (err) {
      console.error('WebLLMProvider: failed to generate suggestion', err);
      throw new Error('WebLLMProvider: failed to generate suggestion', { cause: err });
    }
  }

  isReady(): boolean {
    return this.engine !== null;
  }
}
