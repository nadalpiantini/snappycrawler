'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Download, User, FolderOpen, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  variant?: 'landing' | 'app'
  showExtension?: boolean
  showTryNow?: boolean
  onTryNow?: () => void
}

export function Header({
  variant = 'app',
  showExtension = true,
  showTryNow = false,
  onTryNow
}: HeaderProps) {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setAuthState(session ? 'authenticated' : 'unauthenticated')
    }
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState(session ? 'authenticated' : 'unauthenticated')
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isLanding = variant === 'landing'
  const buttonClass = isLanding
    ? "text-white border-white/30 hover:bg-white/10"
    : ""

  return (
    <header className={`${isLanding ? '' : 'bg-card border-b border-border'}`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Snappy"
            width={isLanding ? 240 : 40}
            height={isLanding ? 240 : 40}
            className={isLanding
              ? "rounded-xl w-20 h-20 sm:w-28 sm:h-28 md:w-[180px] md:h-[180px] lg:w-[240px] lg:h-[240px]"
              : "rounded-lg"
            }
          />
          {!isLanding && (
            <span className="text-xl font-bold text-foreground">Snappy</span>
          )}
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {/* Extension Download */}
          {showExtension && (
            <Button
              size="sm"
              variant="outline"
              className={buttonClass}
              asChild
            >
              <a href="/snappy-extension.zip" download>
                <Download className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Extension</span>
              </a>
            </Button>
          )}

          {/* Auth-dependent buttons */}
          {authState === 'loading' ? (
            // Loading skeleton
            <div className="w-24 h-8 bg-white/10 rounded-md animate-pulse" />
          ) : authState === 'authenticated' ? (
            <>
              <Button
                size="sm"
                variant="outline"
                className={buttonClass}
                asChild
              >
                <Link href="/snapshots">
                  <FolderOpen className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">My Snapshots</span>
                </Link>
              </Button>
              {!isLanding && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                  className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              )}
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className={buttonClass}
              asChild
            >
              <Link href="/login">
                <User className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
          )}

          {/* Try Now button */}
          {showTryNow && onTryNow && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90"
              onClick={onTryNow}
            >
              Try Now
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
