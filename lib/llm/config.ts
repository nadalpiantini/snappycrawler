// ============================================
// LLM CONFIG - DeepSeek Configuration & Token Management
// ============================================

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

// ============================================
// TYPES
// ============================================

export interface LLMConfig {
  provider: 'deepseek' | 'openai' | 'anthropic'
  apiKey: string
  baseURL: string
  model: string
  temperature: number
  maxTokens: number
  timeout: number
}

export interface TokenStorage {
  apiKey: string
  provider: 'deepseek' | 'openai' | 'anthropic'
  createdAt: string
  lastUsed: string
}

// ============================================
// DEEPSEEK DEFAULTS
// ============================================

export const DEEPSEEK_CONFIG: Partial<LLMConfig> = {
  provider: 'deepseek',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 4096,
  timeout: 30000
}

// ============================================
// TOKEN STORAGE (Local)
// ============================================

const TOKEN_DIR = join(homedir(), '.snappycrawler')
const TOKEN_FILE = join(TOKEN_DIR, 'tokens.json')

export function ensureTokenDir(): void {
  if (!existsSync(TOKEN_DIR)) {
    mkdirSync(TOKEN_DIR, { recursive: true })
  }
}

export function saveToken(apiKey: string, provider: 'deepseek' | 'openai' | 'anthropic' = 'deepseek'): void {
  ensureTokenDir()

  const storage: TokenStorage = {
    apiKey,
    provider,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString()
  }

  writeFileSync(TOKEN_FILE, JSON.stringify(storage, null, 2))
  console.log(`✅ Token saved locally to ${TOKEN_FILE}`)
}

export function loadToken(): string | null {
  if (!existsSync(TOKEN_FILE)) {
    return null
  }

  try {
    const data = readFileSync(TOKEN_FILE, 'utf-8')
    const storage: TokenStorage = JSON.parse(data)

    // Update last used
    storage.lastUsed = new Date().toISOString()
    writeFileSync(TOKEN_FILE, JSON.stringify(storage, null, 2))

    return storage.apiKey
  } catch (error) {
    console.error('❌ Error loading token:', error)
    return null
  }
}

export function hasToken(): boolean {
  return existsSync(TOKEN_FILE) && loadToken() !== null
}

export function clearToken(): void {
  if (existsSync(TOKEN_FILE)) {
    // Delete the token file
    const fs = require('fs')
    fs.unlinkSync(TOKEN_FILE)
    console.log('✅ Token cleared')
  }
}

// ============================================
// CONFIG LOADER
// ============================================

export function getLLMConfig(): LLMConfig {
  const apiKey = loadToken()

  if (!apiKey) {
    throw new Error(`
❌ No API token found for DeepSeek.

To set up your DeepSeek token:

1. Get your API key from: https://platform.deepseek.com/api_keys
2. Set it using: snappy config set-token <your-api-key>
3. Or set environment variable: DEEPSEEK_API_KEY

Your token will be stored locally in: ~/.snappycrawler/tokens.json
    `)
  }

  return {
    ...DEEPSEEK_CONFIG,
    apiKey
  } as LLMConfig
}

export function getLLMConfigFromEnv(): LLMConfig {
  const apiKey = process.env.DEEPSEEK_API_KEY ||
                 process.env.OPENAI_API_KEY ||
                 process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error('No LLM API key found in environment variables')
  }

  const provider = process.env.DEEPSEEK_API_KEY ? 'deepseek' :
                   process.env.OPENAI_API_KEY ? 'openai' : 'anthropic'

  return {
    provider,
    apiKey,
    baseURL: provider === 'deepseek' ? 'https://api.deepseek.com/v1' :
                provider === 'openai' ? 'https://api.openai.com/v1' :
                'https://api.anthropic.com/v1',
    model: provider === 'deepseek' ? 'deepseek-chat' :
            provider === 'openai' ? 'gpt-4' : 'claude-3-sonnet',
    temperature: 0.7,
    maxTokens: 4096,
    timeout: 30000
  }
}

// ============================================
// FUTURE: BACKEND API INTEGRATION
// ============================================

export async function getLLMConfigFromBackend(): Promise<LLMConfig> {
  // Placeholder for future backend API integration
  // This will connect to freejack-hub or similar service

  const backendURL = process.env.BACKEND_API_URL || 'http://localhost:3001/api/llm'

  try {
    const response = await fetch(`${backendURL}/config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BACKEND_API_KEY || ''}`
      }
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`)
    }

    const config = await response.json()
    return config as LLMConfig
  } catch (error) {
    console.warn('⚠️  Backend API unavailable, falling back to local config')
    return getLLMConfig()
  }
}
