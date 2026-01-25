import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient, SnapshotService } from '../lib/supabase/client'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: vi.fn(() => Promise.resolve({ data: null, error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null }))
    }
  }))
}))

describe('Supabase Client', () => {
  describe('createClient', () => {
    it('should create supabase client with environment variables', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'

      const client = createClient()

      expect(client).toBeDefined()
      expect(client.from).toBeDefined()
      expect(client.auth).toBeDefined()
    })

    it('should throw error if environment variables are missing', () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL
      delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      expect(() => createClient()).toThrow()
    })
  })

  describe('SnapshotService', () => {
    let mockClient: any

    beforeEach(() => {
      mockClient = {
        from: vi.fn()
      }
    })

    describe('getAll', () => {
      it('should fetch all snapshots for current user', async () => {
        const mockSnapshots = [
          { id: '1', url: 'https://example.com', title: 'Example' },
          { id: '2', url: 'https://test.com', title: 'Test' }
        ]

        mockClient.from.mockReturnValue({
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: mockSnapshots, error: null }))
          }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.getAll()

        expect(result).toEqual(mockSnapshots)
        expect(mockClient.from).toHaveBeenCalledWith('snapshots')
      })

      it('should return empty array on error', async () => {
        mockClient.from.mockReturnValue({
          select: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: new Error('DB Error') }))
          }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.getAll()

        expect(result).toEqual([])
      })

      it('should order by created_at desc', async () => {
        const orderFn = vi.fn(() => Promise.resolve({ data: [], error: null }))

        mockClient.from.mockReturnValue({
          select: vi.fn(() => ({
            order: orderFn
          }))
        })

        const service = new SnapshotService(mockClient)
        await service.getAll()

        expect(orderFn).toHaveBeenCalledWith('created_at', { ascending: false })
      })
    })

    describe('getById', () => {
      it('should fetch snapshot by id', async () => {
        const mockSnapshot = { id: '1', url: 'https://example.com', title: 'Example' }

        mockClient.from.mockReturnValue({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: mockSnapshot, error: null }))
            }))
          }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.getById('1')

        expect(result).toEqual(mockSnapshot)
      })

      it('should return null if snapshot not found', async () => {
        mockClient.from.mockReturnValue({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: null, error: new Error('Not found') }))
            }))
          }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.getById('999')

        expect(result).toBeNull()
      })
    })

    describe('create', () => {
      it('should insert new snapshot', async () => {
        const newSnapshot = {
          url: 'https://example.com',
          title: 'Example',
          raw_data: { html: '<html></html>', text: [], ux: [] }
        }

        const createdSnapshot = { id: '1', ...newSnapshot }

        mockClient.from.mockReturnValue({
          insert: vi.fn(() => Promise.resolve({ data: createdSnapshot, error: null }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.create(newSnapshot)

        expect(result).toEqual(createdSnapshot)
        expect(mockClient.from).toHaveBeenCalledWith('snapshots')
      })

      it('should return null on insert error', async () => {
        const newSnapshot = {
          url: 'https://example.com',
          title: 'Example',
          raw_data: { html: '', text: [], ux: [] }
        }

        mockClient.from.mockReturnValue({
          insert: vi.fn(() => Promise.resolve({ data: null, error: new Error('Insert failed') }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.create(newSnapshot)

        expect(result).toBeNull()
      })
    })

    describe('update', () => {
      it('should update existing snapshot', async () => {
        const updatedSnapshot = {
          id: '1',
          url: 'https://example.com',
          title: 'Updated Title'
        }

        mockClient.from.mockReturnValue({
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: updatedSnapshot, error: null }))
          }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.update('1', { title: 'Updated Title' })

        expect(result).toEqual(updatedSnapshot)
      })

      it('should return null on update error', async () => {
        mockClient.from.mockReturnValue({
          update: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: null, error: new Error('Update failed') }))
          }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.update('1', { title: 'New Title' })

        expect(result).toBeNull()
      })
    })

    describe('delete', () => {
      it('should delete snapshot by id', async () => {
        mockClient.from.mockReturnValue({
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
          }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.delete('1')

        expect(result).toBe(true)
      })

      it('should return false on delete error', async () => {
        mockClient.from.mockReturnValue({
          delete: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: null, error: new Error('Delete failed') }))
          }))
        })

        const service = new SnapshotService(mockClient)
        const result = await service.delete('1')

        expect(result).toBe(false)
      })
    })
  })
})
