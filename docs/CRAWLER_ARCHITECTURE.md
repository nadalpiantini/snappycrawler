# Snappy Platform - Auto-Crawler System

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SNAPPY CRAWLER v2.1                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. EXTENSION (Crawler)                                     │
│     ├─ Discover URLs from page                             │
│     ├─ Filter & Deduplicate                                │
│     ├─ Queue management                                      │
│     ├─ Auto-capture snapshots                               │
│     └─ POST to Snappy API                                   │
│                                                               │
│  2. WEB APP (API + Queue)                                   │
│     ├─ POST /api/snapshot (receive)                          │
│     ├─ Validate & Save to Supabase                          │
│     ├─ Queue for processing                                 │
│     └─ Real-time updates                                     │
│                                                               │
│  3. SUPABASE (Storage)                                      │
│     ├─ snappy_snapshots                                     │
│     ├─ snappy_normalized_snapshots                          │
│     ├─ Crawl jobs tracking                                  │
│     └─ Processed pages count                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘

FLOW:
1. User enters "yamdu.com" in extension
2. Extension crawls site automatically:
   - Start page → Extract links → Filter same-domain → Queue
   - Process queue: Visit page → Capture → POST to API → Next
3. API saves to Supabase with metadata
4. User views all snapshots in web app
```

## Implementation Plan

### Phase 1: API Endpoint (5 min)
- POST /api/snapshot
- Validate JSON
- Save to Supabase
- Return success

### Phase 2: Crawler Extension (15 min)
- URL discovery (links, sitemap)
- Deduplication (visited URLs)
- Queue management
- Auto-navigation
- POST to API

### Phase 3: Queue UI (10 min)
- Show crawl progress
- Pages captured count
- Errors/failed pages
- Stop/pause controls

### Phase 4: Testing & Polish (10 min)
- Test on yamdu.com
- Rate limiting (don't DDOS)
- Error handling
- Success validation

TOTAL: ~40 min implementation
