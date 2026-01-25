import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { DatabaseSnapshot, NormalizedSnapshot, RawSnapshot } from '../types'

/**
 * Create Supabase client (lazy initialization to avoid build-time errors)
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient(url, key)
}

/**
 * Snapshot service for database operations
 */
export class SnapshotService {
  private supabase: ReturnType<typeof createClient>

  constructor(client?: ReturnType<typeof createClient>) {
    this.supabase = client || createClient()
  }

  /**
   * Get all snapshots for current user
   */
  async getAll(): Promise<DatabaseSnapshot[]> {
    try {
      const { data, error } = await this.supabase
        .from('snappy_snapshots')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching snapshots:', error)
      return []
    }
  }

  /**
   * Get snapshot by ID
   */
  async getById(id: string): Promise<DatabaseSnapshot | null> {
    try {
      const { data, error } = await this.supabase
        .from('snappy_snapshots')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching snapshot:', error)
      return null
    }
  }

  /**
   * Create new snapshot
   */
  async create(snapshot: Omit<DatabaseSnapshot, 'id' | 'user_id' | 'created_at'>): Promise<DatabaseSnapshot | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()

      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await this.supabase
        .from('snappy_snapshots')
        .insert({
          ...snapshot,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error creating snapshot:', error)
      return null
    }
  }

  /**
   * Update snapshot
   */
  async update(id: string, updates: Partial<DatabaseSnapshot>): Promise<DatabaseSnapshot | null> {
    try {
      const { data, error } = await this.supabase
        .from('snappy_snapshots')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error updating snapshot:', error)
      return null
    }
  }

  /**
   * Delete snapshot
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('snappy_snapshots')
        .delete()
        .eq('id', id)

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error deleting snapshot:', error)
      return false
    }
  }

  /**
   * Get normalized snapshot
   */
  async getNormalized(snapshotId: string): Promise<NormalizedSnapshot | null> {
    try {
      const { data, error } = await this.supabase
        .from('snappy_normalized_snapshots')
        .select('normalized_data')
        .eq('snapshot_id', snapshotId)
        .single()

      if (error) throw error

      return data?.normalized_data || null
    } catch (error) {
      console.error('Error fetching normalized snapshot:', error)
      return null
    }
  }

  /**
   * Save normalized snapshot
   */
  async saveNormalized(snapshotId: string, normalized: NormalizedSnapshot, legalSafe = false): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('snappy_normalized_snapshots')
        .insert({
          snapshot_id: snapshotId,
          normalized_data: normalized,
          legal_safe: legalSafe
        })

      if (error) throw error

      return true
    } catch (error) {
      console.error('Error saving normalized snapshot:', error)
      return false
    }
  }
}

// Export singleton instance
export const snapshotService = new SnapshotService()
