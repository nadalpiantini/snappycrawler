'use client'

import { useCallback, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Check, AlertCircle, Loader2 } from 'lucide-react'
import { RawSnapshot } from '@/lib/types'

interface SnapshotUploaderProps {
  onUpload: (snapshot: RawSnapshot) => void
}

type UploadState = 'idle' | 'loading' | 'success' | 'error'

export function SnapshotUploader({ onUpload }: SnapshotUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    setUploadState('loading')

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file (.json)')
      setUploadState('error')
      return
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB')
      setUploadState('error')
      return
    }

    // Simulate loading for better UX
    setTimeout(() => {
      // Read and parse file
      const reader = new FileReader()

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string
          const snapshot = JSON.parse(content) as RawSnapshot

          // Validate snapshot structure
          if (!snapshot.url || !snapshot.html || !Array.isArray(snapshot.text)) {
            setError('Invalid snapshot format. Missing required fields: url, html, or text array')
            setUploadState('error')
            return
          }

          // Validate URL format
          try {
            new URL(snapshot.url)
          } catch {
            setError('Invalid URL format in snapshot')
            setUploadState('error')
            return
          }

          // Success!
          setUploadState('success')
          setTimeout(() => {
            onUpload(snapshot)
          }, 500)
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Failed to parse JSON file'
          setError(`Invalid JSON: ${errorMsg}`)
          setUploadState('error')
          console.error('Parse error:', err)
        }
      }

      reader.onerror = () => {
        setError('Failed to read file')
        setUploadState('error')
      }

      reader.readAsText(file)
    }, 300)
  }, [onUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const resetState = () => {
    setUploadState('idle')
    setError(null)
  }

  return (
    <Card
      className={`transition-all ${
        isDragging
          ? 'border-primary border-2 bg-primary/5 scale-[1.02]'
          : uploadState === 'error'
          ? 'border-destructive border-2'
          : uploadState === 'success'
          ? 'border-green-500 border-2 bg-green-50 dark:bg-green-950'
          : 'border-dashed'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {uploadState === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
          {uploadState === 'success' && <Check className="w-5 h-5 text-green-600" />}
          {uploadState === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
          {(uploadState === 'idle' || uploadState === 'loading') && <Upload className="w-5 h-5" />}
          Upload Snapshot
        </CardTitle>
        <CardDescription>
          {uploadState === 'idle' && 'Drag & drop a snapshot JSON file or click to browse'}
          {uploadState === 'loading' && 'Processing your snapshot...'}
          {uploadState === 'success' && 'Snapshot loaded successfully!'}
          {uploadState === 'error' && 'There was an error with your file'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center justify-center py-8">
          {uploadState === 'idle' && (
            <>
              <Upload className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground text-center mb-4">
                Upload a snapshot file generated by the Snappy extension
              </p>
              <label>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleFileInput}
                />
                <Button asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </>
          )}

          {uploadState === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Parsing JSON and validating structure...
              </p>
            </>
          )}

          {uploadState === 'success' && (
            <>
              <Check className="w-12 h-12 text-green-600 mb-4" />
              <p className="text-sm text-muted-foreground text-center">
                Redirecting to snapshot viewer...
              </p>
            </>
          )}

          {uploadState === 'error' && (
            <>
              <AlertCircle className="w-12 h-12 text-destructive mb-4" />
              <p className="text-sm text-muted-foreground text-center mb-4">
                {error || 'Failed to process snapshot'}
              </p>
              <Button variant="outline" onClick={resetState}>
                Try Again
              </Button>
            </>
          )}
        </div>

        {/* File Requirements */}
        {uploadState === 'idle' && (
          <div className="mt-4 p-4 bg-muted rounded-md">
            <p className="text-xs font-semibold mb-2">File Requirements:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✅ JSON format (.json)</li>
              <li>✅ Maximum 10MB file size</li>
              <li>✅ Must contain: url, html, text array</li>
              <li>✅ Generated by Snappy Chrome extension</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
