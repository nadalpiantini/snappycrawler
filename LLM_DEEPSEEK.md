# 🤖 LLM Integration Guide - DeepSeek

**Version**: 2.1.0
**Provider**: DeepSeek Chat API
**Status**: Production Ready

---

## 🎯 Overview

SnappyCrawler now uses **DeepSeek Chat API** as the default LLM provider for all AI-powered features:

- **AI Context Pack** - Generate system prompts for developers, designers, PMs
- **Brain LLM** - Cross-mode reasoning and insights
- **Code Generation** - Generate code from specifications
- **Analysis** - Debug, refactor, and analyze code

---

## 🔑 Setup DeepSeek API Token

### Option 1: Save Token Locally (Recommended)

```bash
# Get your API key from: https://platform.deepseek.com/api_keys
snappy config:set-token sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Verify token is saved
snappy config:status

# Test connection
snappy config:test
```

Your token is saved locally in: `~/.snappycrawler/tokens.json`

### Option 2: Environment Variable

```bash
# Add to .env.local or .env.production
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Option 3: Runtime Token

```bash
DEEPSEEK_API_KEY=sk-xxx snappy pull <id> --ai
```

---

## 📋 CLI Commands

### Token Management

```bash
# Set your API token
snappy config:set-token <your-api-key>

# Check token status
snappy config:status

# Test API connection
snappy config:test

# Clear saved token
snappy config:clear-token

# Show prompt examples
snappy config:prompts
```

### Using DeepSeek in Analysis

```bash
# Generate AI context (uses DeepSeek)
snappy pull <snapshot-id> --ai

# Generate wireframe with AI prompts
snappy pull <snapshot-id> --wireframe

# Full analysis with Brain LLM
snappy pull <snapshot-id> --all
```

---

## 🚀 Programmatic Usage

### Basic Usage

```typescript
import { DeepSeekClient, createDeepSeekClient } from './lib/llm'

// Create client (automatically loads token)
const client = createDeepSeekClient()

// Send message
const response = await client.sendMessage(
  'You are a helpful assistant.',
  'Explain React hooks in simple terms.'
)

console.log(response)
```

### Advanced Usage

```typescript
import { DeepSeekClient } from './lib/llm/deepseek-client'
import { getLLMConfig } from './lib/llm/config'

// Custom configuration
const client = new DeepSeekClient({
  provider: 'deepseek',
  apiKey: 'sk-xxx',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 4096,
  timeout: 30000
})

// Chat with history
const response = await client.chat({
  messages: [
    { role: 'system', content: 'You are an expert developer.' },
    { role: 'user', content: 'Explain useState.' },
    { role: 'assistant', content: 'useState is a hook...' },
    { role: 'user', content: 'How about useEffect?' }
  ]
})

console.log(response.choices[0].message.content)
```

### Using Optimized Prompts

```typescript
import {
  generateDeveloperPrompt,
  generateCodePrompt,
  generateDebugPrompt
} from './lib/llm/prompts'

// Get system prompt for developer
const systemPrompt = generateDeveloperPrompt(systemBrief, constraints)

// Generate code
const codePrompt = generateCodePrompt('Create a login form', {
  language: 'TypeScript',
  framework: 'React',
  patterns: ['functional components', 'hooks']
})

// Debug issue
const debugPrompt = generateDebugPrompt(
  'TypeError: Cannot read property "map" of undefined',
  code,
  'This happens when loading user data'
)
```

---

## ⚡ Prompt Optimization

DeepSeek performs best with:

### ✅ DO

- **Clear, structured instructions** - Use headers and bullet points
- **Examples in the prompt** - Few-shot learning improves quality
- **Explicit output format** - Specify JSON, code blocks, etc.
- **Concise system prompts** - Under 2000 characters ideal
- **Direct user messages** - Be specific and actionable

### ❌ DON'T

- **Excessive verbosity** - DeepSeek prefers concise prompts
- **Ambiguous instructions** - Be explicit about requirements
- **Multiple tasks in one prompt** - One task per prompt
- **Overly long context** - Token limit is 4096 (can be increased)

---

## 🔧 Configuration

### Token Storage

Tokens are stored locally in: `~/.snappycrawler/tokens.json`

```json
{
  "apiKey": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "provider": "deepseek",
  "createdAt": "2026-01-26T15:00:00.000Z",
  "lastUsed": "2026-01-26T15:30:00.000Z"
}
```

### Environment Variables

```bash
# DeepSeek API (primary)
DEEPSEEK_API_KEY=sk-xxx

# Backend API (future - freejack-hub integration)
BACKEND_API_URL=http://localhost:3001/api/llm
BACKEND_API_KEY=your-backend-key
```

---

## 📊 Monitoring

### API Usage Logging

Every API call logs usage statistics:

```bash
📊 DeepSeek Usage:
   Prompt tokens: 150
   Completion tokens: 850
   Total tokens: 1000
   Duration: 1,250ms
   Speed: 680.00 tokens/sec
```

### Cost Estimation

DeepSeek Chat pricing (as of 2026):
- **Input**: $0.14 per 1M tokens
- **Output**: $0.28 per 1M tokens

Example cost analysis:
```
Full analysis with Brain LLM:
- Input: ~5,000 tokens = $0.0007
- Output: ~2,000 tokens = $0.00056
- Total per snapshot: ~$0.0013
```

---

## 🔒 Security

### Token Security

- ✅ **Stored locally** - Token never leaves your machine
- ✅ **File permissions** - Only you can read `~/.snappycrawler/tokens.json`
- ✅ **Environment fallback** - Can use `DEEPSEEK_API_KEY` env var
- ✅ **No telemetry** - Token never sent to SnappyCrawler servers

### Best Practices

1. **Never commit tokens** - `tokens.json` is in `.gitignore`
2. **Rotate regularly** - Change your API key every 90 days
3. **Use environment variables** in production (`.env.production`)
4. **Monitor usage** - Check DeepSeek dashboard for suspicious activity

---

## 🚀 Production Deployment

### Vercel Deployment

```bash
# 1. Set environment variable in Vercel dashboard
# DEEPSEEK_API_KEY = sk-xxx

# 2. Deploy
vercel --prod

# 3. Verify
snappy config:status
```

### Using Backend API (Future)

```typescript
// When backend API is available (freejack-hub integration)
import { getLLMConfigFromBackend } from './lib/llm/config'

// Automatically fetches config from backend
const config = await getLLMConfigFromBackend()

// Falls back to local token if backend unavailable
const client = new DeepSeekClient(config)
```

---

## 🐛 Troubleshooting

### "No API token found"

```bash
# Check if token is set
snappy config:status

# Set token
snappy config:set-token <your-api-key>

# Or use environment variable
export DEEPSEEK_API_KEY=sk-xxx
```

### "API timeout"

```bash
# Increase timeout in code
const client = new DeepSeekClient({
  ...config,
  timeout: 60000  // 60 seconds
})
```

### "Rate limit exceeded"

DeepSeek rate limits:
- **Free tier**: 200 requests per day
- **Paid tier**: Depends on plan

Solution: Implement caching or upgrade plan

---

## 📚 Examples

### Example 1: Generate System Prompt

```typescript
import { generateDeveloperPrompt } from './lib/llm/prompts'

const brief = {
  overview: {
    pageTitle: 'My App',
    url: 'https://myapp.com',
    pageType: 'dashboard',
    primaryPurpose: 'Show analytics',
    targetUsers: ['admins'],
    coreValue: 'Data insights'
  },
  // ... rest of brief
}

const constraints = {
  technical: [],
  business: [],
  design: [],
  negative: []
}

const prompt = generateDeveloperPrompt(brief, constraints)
console.log(prompt)
```

### Example 2: Code Generation

```typescript
import { DeepSeekClient } from './lib/llm/deepseek-client'
import { generateCodePrompt } from './lib/llm/prompts'

const client = new DeepSeekClient()

const prompt = generateCodePrompt(
  'Create a reusable Button component with variants',
  {
    language: 'TypeScript',
    framework: 'React',
    patterns: ['compound components', 'variant props']
  }
)

const code = await client.sendMessage(
  'You are a React expert.',
  prompt
)

console.log(code)
```

### Example 3: Debug Issue

```typescript
import { generateDebugPrompt } from './lib/llm/prompts'

const debugPrompt = generateDebugPrompt(
  'Error: Hydration failed because the initial UI does not match what was rendered on the server.',
  myComponentCode,
  'This happens in Next.js 13 with app directory'
)

const solution = await client.sendMessage(
  'You are a Next.js debugging expert.',
  debugPrompt
)

console.log(solution)
```

---

## 🎓 Best Practices

### 1. Prompt Engineering

```typescript
// ❌ Too vague
const bad = 'Create a form'

// ✅ Specific with context
const good = generateCodePrompt('Create a login form with email and password fields', {
  language: 'TypeScript',
  framework: 'React',
  patterns: ['controlled components', 'form validation']
})
```

### 2. Error Handling

```typescript
try {
  const response = await client.chat({
    messages: [
      { role: 'system', content: 'You are an expert.' },
      { role: 'user', content: 'Help!' }
    ]
  })
  console.log(response.choices[0].message.content)
} catch (error) {
  if (error instanceof DeepSeekError) {
    console.error(`DeepSeek error ${error.code}: ${error.message}`)
  }
  throw error
}
```

### 3. Streaming Responses

```typescript
async function* streamResponse() {
  const stream = client.chatStream({
    messages: [
      { role: 'system', content: 'You are an expert.' },
      { role: 'user', content: 'Explain async/await.' }
    ]
  })

  for await (const chunk of stream) {
    process.stdout.write(chunk)
  }
}
```

---

## 📖 References

- [DeepSeek API Documentation](https://platform.deepseek.com/docs)
- [DeepSeek Pricing](https://platform.deepseek.com/pricing)
- [Get API Key](https://platform.deepseek.com/api_keys)

---

**Last Updated**: January 26, 2026
**Version**: 2.1.0
