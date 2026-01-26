// ============================================
// DEEPSEEK CLIENT - Optimized for DeepSeek API
// ============================================

import type { LLMConfig } from './config'
import { getLLMConfig } from './config'

// ============================================
// TYPES
// ============================================

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  messages: Message[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

// ============================================
// DEEPSEEK CLIENT
// ============================================

export class DeepSeekClient {
  private config: LLMConfig

  constructor(config?: LLMConfig) {
    this.config = config || getLLMConfig()
  }

  /**
   * Send chat completion request to DeepSeek
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now()

    try {
      const response = await fetch(`${this.config.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: request.messages,
          temperature: request.temperature ?? this.config.temperature,
          max_tokens: request.max_tokens ?? this.config.maxTokens,
          stream: request.stream ?? false
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`DeepSeek API error (${response.status}): ${error}`)
      }

      const data: ChatResponse = await response.json()

      const duration = Date.now() - startTime
      this.logUsage(data.usage, duration)

      return data
    } catch (error) {
      if (error instanceof Error && (error.name === 'AbortError' || error.name === 'TimeoutError')) {
        throw new Error(`DeepSeek API timeout after ${this.config.timeout}ms`)
      }
      throw error
    }
  }

  /**
   * Send simple message (system + user)
   */
  async sendMessage(
    systemPrompt: string,
    userMessage: string
  ): Promise<string> {
    const response = await this.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })

    return response.choices[0]?.message?.content || ''
  }

  /**
   * Stream chat completion
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<string> {
    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: request.messages,
        temperature: request.temperature ?? this.config.temperature,
        max_tokens: request.max_tokens ?? this.config.maxTokens,
        stream: true
      }),
      signal: AbortSignal.timeout(this.config.timeout)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`DeepSeek API error (${response.status}): ${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('No response body')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              yield content
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Log API usage for monitoring
   */
  private logUsage(usage: ChatResponse['usage'], duration: number): void {
    const tokensPerSecond = (usage.completion_tokens / (duration / 1000)).toFixed(2)

    console.log(`📊 DeepSeek Usage:`)
    console.log(`   Prompt tokens: ${usage.prompt_tokens}`)
    console.log(`   Completion tokens: ${usage.completion_tokens}`)
    console.log(`   Total tokens: ${usage.total_tokens}`)
    console.log(`   Duration: ${duration}ms`)
    console.log(`   Speed: ${tokensPerSecond} tokens/sec`)
  }
}

// ============================================
// FACTORY
// ============================================

export function createDeepSeekClient(config?: LLMConfig): DeepSeekClient {
  return new DeepSeekClient(config)
}

// ============================================
// PROMPT OPTIMIZATION FOR DEEPSEEK
// ============================================

/**
 * DeepSeek performs best with:
 * - Clear, structured instructions
 * - Examples in the prompt
 * - Explicit output format
 * - Concise system prompts
 * - Direct user messages
 */
export class DeepSeekPromptOptimizer {
  /**
   * Optimize system prompt for DeepSeek
   */
  static optimizeSystemPrompt(prompt: string): string {
    // Remove excessive verbosity
    let optimized = prompt
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/\s{2,}/g, ' ')    // Collapse multiple spaces
      .trim()

    // Add DeepSeek-specific optimization
    if (optimized.length > 2000) {
      console.warn('⚠️  System prompt is very long (>2000 chars), DeepSeek works best with concise prompts')
    }

    return optimized
  }

  /**
   * Format user message for DeepSeek
   */
  static formatUserMessage(message: string, context?: Record<string, any>): string {
    let formatted = message

    if (context) {
      formatted = `
CONTEXT:
${JSON.stringify(context, null, 2)}

TASK:
${message}
      `.trim()
    }

    return formatted
  }

  /**
   * Add few-shot examples for better DeepSeek performance
   */
  static addExamples(prompt: string, examples: Array<{ input: string; output: string }>): string {
    if (examples.length === 0) return prompt

    const examplesSection = examples
      .map((ex, i) => `
Example ${i + 1}:
Input: ${ex.input}
Output: ${ex.output}
      `.trim())
      .join('\n\n')

    return `
${prompt}

EXAMPLES:
${examplesSection}

Now, apply the same pattern to the user's request.
    `.trim()
  }
}

// ============================================
// ERROR HANDLING
// ============================================

export class DeepSeekError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'DeepSeekError'
  }
}

export function handleDeepSeekError(error: any): never {
  if (error.response) {
    throw new DeepSeekError(
      error.response.data?.error?.message || error.message,
      error.response.data?.error?.code,
      error.response.status
    )
  }
  throw error
}
