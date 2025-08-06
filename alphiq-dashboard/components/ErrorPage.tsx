'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ErrorPageProps {
  error?: Error
  reset?: () => void
  statusCode?: number
  title?: string
  message?: string
}

export default function ErrorPage({ 
  error, 
  reset, 
  statusCode = 500, 
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.'
}: ErrorPageProps) {
  const router = useRouter()
  const [isRetrying, setIsRetrying] = useState(false)
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      if (reset) {
        reset()
      } else {
        window.location.reload()
      }
    } catch (err) {
      console.error('Retry failed:', err)
    } finally {
      setIsRetrying(false)
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  const getErrorDetails = () => {
    switch (statusCode) {
      case 404:
        return {
          title: 'Page Not Found',
          message: 'The page you\'re looking for doesn\'t exist.',
          icon: '🔍',
          color: 'text-blue-400'
        }
      case 403:
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to access this resource.',
          icon: '🚫',
          color: 'text-red-400'
        }
      case 500:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          icon: '⚡',
          color: 'text-orange-400'
        }
      default:
        return {
          title,
          message,
          icon: '❌',
          color: 'text-gray-400'
        }
    }
  }

  const errorDetails = getErrorDetails()

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-charcoal/95 to-charcoal flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Animated Error Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-white text-sm font-bold">{statusCode}</span>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-neutral mb-2">
            {errorDetails.title}
          </h1>
          <p className="text-neutral/70 text-lg leading-relaxed">
            {errorDetails.message}
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-neutral/60 hover:text-neutral/80 text-sm font-medium">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <pre className="text-xs text-red-300 overflow-auto">
                  {error.stack || error.message}
                </pre>
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex-1 bg-amber hover:bg-amber/90 disabled:bg-amber/50 text-charcoal font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105 disabled:scale-100"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>

            <button
              onClick={handleGoBack}
              className="flex-1 bg-white/10 hover:bg-white/20 text-neutral font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>

          {/* Home Link */}
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-neutral/60 hover:text-amber transition-colors duration-200"
            >
              <Home className="w-4 h-4" />
              Return to Home
            </Link>
          </div>

          {/* Auto-refresh countdown */}
          {countdown > 0 && (
            <div className="mt-4 text-sm text-neutral/50">
              Auto-refreshing in {countdown} seconds...
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-10 -left-10 w-20 h-20 bg-red-500/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  )
} 