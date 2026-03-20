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
          {uploadState === 'success' && <Check className="w-5 h-5 text-green-500" />}
          {uploadState === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
          <Upload className="w-5 h-5" />
          Upload Snapshot
        </CardTitle>
        <CardDescription>
          Drag and drop a JSON file or click to browse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            {uploadState === 'idle' && (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop or click to upload a JSON snapshot file
                </p>
              </>
            )}
            {uploadState === 'loading' && (
              <p className="text-sm">Processing your snapshot...</p>
            )}
            {uploadState === 'success' && (
              <p className="text-sm text-green-600">Snapshot uploaded successfully!</p>
            )}
            {uploadState === 'error' && (
              <div className="space-y-2">
                <p className="text-sm text-destructive">Error uploading snapshot</p>
                {error && <p className="text-xs text-destructive/80">{error}</p>}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <input
              type="file"
              accept=".json"
              className="hidden"
              ref={(input) => {
                if (input) {
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files
                    if (files && files.length > 0) {
                      handleFile(files[0])
                    }
                  }
                }
              }}
              id="file-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploadState === 'loading'}
            >
              Choose File
            </Button>
            {(uploadState === 'error' || uploadState === 'success') && (
              <Button variant="ghost" onClick={resetState}>
                Reset
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Requirements:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>JSON format with .json extension</li>
              <li>Maximum file size: 10MB</li>
              <li>Must contain: url, html, and text array</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}