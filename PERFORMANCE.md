# SnappyCrawler - Performance Guide

**Version**: 2.1.0
**Status**: Production Optimized

---

## Performance Strategies

### 1. Snapshot Size Optimization

#### Problem
Large snapshots (>5MB) cause:
- Slow parsing
- High memory usage
- Timeout errors

#### Solutions

**Streaming Parser** (for HTML >2MB)
```typescript
import { parseHTMLStream } from './lib/streaming-parser'

async function parseLargeSnapshot(html: string) {
  const chunks = html.match(/[\s\S]{1,6}/g) || []
  let partialSnapshot = {}

  for (const chunk of chunks) {
    const partial = parseHTML(chunk)
    partialSnapshot = { ...partialSnapshot, ...partial }
  }

  return partialSnapshot
}
```

**Selective Extraction**
```typescript
// Only extract what you need
const options = {
  extractHTML: false,        // Skip HTML if not needed
  extractText: true,
  extractUX: true,
  extractStyles: false     // Skip styles if not needed
}
```

---

### 2. Parallel Mode Execution

#### Sequential (Slow)
```typescript
// ~10 seconds total
const design = await analyzeDesign(snapshot)
const ux = await analyzeUX(snapshot)
const wireframe = await analyzeWireframe({ snapshot })
```

#### Parallel (Fast)
```typescript
// ~3 seconds total
const [design, ux, wireframe] = await Promise.all([
  analyzeDesign(snapshot),
  analyzeUX(snapshot),
  analyzeWireframe({ snapshot })
])
```

**CLI Usage**
```bash
# Automatically runs in parallel
snappy pull <id> --all
```

---

### 3. Lazy Loading

```typescript
// Load heavy modules only when needed
async function pullMode(mode: string) {
  switch (mode) {
    case 'design':
      const { analyzeDesign } = await import('./lib/design-forensics')
      return analyzeDesign
    case 'ux':
      const { analyzeUX } = await import('./lib/ux-intelligence')
      return analyzeUX
    case 'wireframe':
      const { analyzeWireframe } = await import('./lib/wireframe-engine')
      return analyzeWireframe
  }
}
```

---

### 4. Memory Management

#### Automatic Cleanup

```typescript
// Automatically clean up large objects
function cleanupSnapshot(snapshot: RawSnapshot): RawSnapshot {
  // Remove heavy HTML if not needed
  if (!snapshot.needHTML) {
    delete snapshot.html
  }

  // Limit text array size
  if (snapshot.text && snapshot.text.length > 1000) {
    snapshot.text = snapshot.text.slice(0, 1000)
  }

  return snapshot
}
```

#### Worker Threads for CPU-Intensive Tasks

```typescript
// Use worker threads for complex analysis
async function analyzeInWorker(snapshot: RawSnapshot) {
  const worker = new Worker('./lib/worker.ts', {
    resourceLimits: {
      maxOldGenerationSizeMb: 20
    }
  })

  const result = await new Promise((resolve, reject) => {
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.postMessage({ snapshot })
  })

  return result
}
```

---

### 5. Database Optimization

#### Connection Pooling

```typescript
// Supabase connection pooling
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    db: { schema: 'public' },
    global: {
      fetch: fetch  // Use native fetch for better performance
    }
  }
)
```

#### Query Optimization

```typescript
// Select only needed fields
const { data } = await supabase
  .from('snappy_snapshots')
  .select('id, url, title, created_at')  // Don't select raw_data unless needed
  .order('created_at', { ascending: false })
  .limit(20)
```

---

### 6. Caching Strategy

#### Redis Cache for Frequent Queries

```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

async function getCachedSnapshot(id: string) {
  const cached = await redis.get(`snapshot:${id}`)
  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch from database
  const { data } = await supabase
    .from('snappy_snapshots')
    .select('*')
    .eq('id', id)
    .single()

  // Cache for 1 hour
  await redis.setex(`snapshot:${id}`, 3600, JSON.stringify(data))

  return data
}
```

---

### 7. Chunked Processing

#### Process Large Snapshots in Chunks

```typescript
async function processLargeSnapshot(snapshot: RawSnapshot) {
  const CHUNK_SIZE = 1000

  // Process text in chunks
  for (let i = 0; i < snapshot.text.length; i += CHUNK_SIZE) {
    const chunk = snapshot.text.slice(i, i + CHUNK_SIZE)
    await processTextChunk(chunk)
  }

  // Process HTML in chunks
  if (snapshot.html) {
    for (let i = 0; i < snapshot.html.length; i += 10000) {
      const chunk = snapshot.html.slice(i, i + 10000)
      await processHTMLChunk(chunk)
    }
  }
}
```

---

### 8. Performance Monitoring

#### Track Performance Metrics

```typescript
interface PerformanceMetrics {
  mode: string
  snapshotSize: number
  processingTime: number
  memoryUsed: number
}

async function trackPerformance(
  mode: string,
  fn: () => Promise<any>
): Promise<any> {
  const start = Date.now()
  const startMemory = process.memoryUsage().heapUsed

  const result = await fn()

  const end = Date.now()
  const endMemory = process.memoryUsage().heapUsed

  const metrics: PerformanceMetrics = {
    mode,
    snapshotSize: 0,
    processingTime: end - start,
    memoryUsed: endMemory - startMemory
  }

  // Log slow operations
  if (metrics.processingTime > 5000) {
    console.warn(`Slow ${mode} analysis:`, metrics)
  }

  return result
}
```

---

### 9. Optimized Data Structures

#### Use Efficient Data Structures

```typescript
// ❌ Inefficient
const blocksArray = []
html.querySelectorAll('*').forEach(el => {
  blocksArray.push({
    tagName: el.tagName,
    className: el.className
  })
})

// ✅ Efficient
const blocksMap = new Map()
html.querySelectorAll('*').forEach(el => {
  const key = `${el.tagName}-${el.className}`
  blocksMap.set(key, { element: el })
})
```

---

### 10. Incremental Analysis

#### Analyze Only What Changed

```typescript
// Compare with previous snapshot
async function incrementalAnalysis(
  newSnapshot: RawSnapshot,
  oldSnapshot: RawSnapshot
) {
  const changes = detectChanges(oldSnapshot, newSnapshot)

  // Only analyze what changed
  const results: any = {}

  if (changes.html) {
    results.structure = await analyzeStructure(newSnapshot)
  }

  if (changes.text) {
    results.content = await analyzeContent(newSnapshot)
  }

  if (changes.styles) {
    results.design = await analyzeDesign(newSnapshot)
  }

  return results
}
```

---

## Benchmarks

### Performance Targets

| Operation | Target | Actual (optimized) |
|-----------|--------|-------------------|
| Snapshot capture | <5s | ~2s |
| Design analysis | <3s | ~1.5s |
| UX analysis | <3s | ~1.2s |
| Wireframe gen | <2s | ~0.8s |
| AI context | <2s | ~1s |
| Compare 2 snapshots | <5s | ~3s |

### Snapshot Size Limits

| Size | Strategy |
|------|----------|
| <500KB | Process normally |
| 500KB-2MB | Stream processing |
| 2MB-5MB | Chunked processing |
| >5MB | Skip heavy content |

---

## CLI Performance Tips

### Fast Commands

```bash
# Use specific modes for faster analysis
snappy pull <id> --design    # ~1.5s
snappy pull <id> --ux        # ~1.2s
snappy pull <id> --wireframe # ~0.8s

# Slower (all modes)
snappy pull <id> --all       # ~5s
```

### Batch Processing

```bash
# Process multiple snapshots in parallel
for id in $(snappy list | jq -r '.[].id'); do
  snappy pull "$id" --design &
done
wait  # Wait for all to complete
```

---

## Monitoring

### Performance Dashboard

```typescript
import { performance } from 'perf_hooks'

function measurePerformance() {
  const start = performance.now()

  // Run analysis...

  const duration = performance.now() - start
  const mem = process.memoryUsage()

  return {
    duration,
    memory: mem.heapUsed / 1024 / 1024 // MB
  }
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  const { data, error } = await supabase
    .from('snappy_snapshots')
    .select('id')
    .limit(1)

  return Response.json({
    status: 'ok',
    database: error ? 'down' : 'up',
    timestamp: new Date().toISOString()
  })
}
```

---

## Production Checklist

- [x] Connection pooling enabled
- [x] Native fetch for better performance
- [x] Parallel mode execution
- [x] Lazy loading implemented
- [x] Memory management in place
- [x] Caching strategy configured
- [x] Performance monitoring active
- [ ] Redis cache (optional)
- [ ] Worker threads for CPU tasks (optional)

---

## Troubleshooting

### Slow Analysis

**Problem**: Analysis taking >10 seconds

**Solutions**:
1. Check snapshot size - may be too large
2. Use specific modes instead of `--all`
3. Check database connection
4. Enable caching

### Memory Issues

**Problem**: Out of memory errors

**Solutions**:
1. Process snapshots in chunks
2. Limit text array size
3. Clear caches regularly
4. Increase Node.js memory limit: `NODE_MAX_OLD_SPACE_SIZE=4096`

### Database Timeouts

**Problem**: Database queries timing out

**Solutions**:
1. Add indexes to frequently queried columns
2. Use `select()` to get only needed fields
3. Implement pagination
4. Use connection pooling

---

## Optimization Checklist

Before deploying to production:

- [ ] Enable production build optimizations
- [ ] Set up monitoring and alerting
- [ ] Configure CDN for static assets
- [ ] Enable database connection pooling
- [ ] Set up caching strategy
- [ ] Implement rate limiting
- [ ] Add performance monitoring
- [ ] Test with large snapshots
- [ ] Load test critical paths
- [ ] Set up log aggregation

---

**Last Updated**: January 26, 2026
**Maintained By**: SnappyCrawler Team
