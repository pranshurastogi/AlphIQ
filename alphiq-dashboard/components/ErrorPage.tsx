'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorPageProps {
  message?: string
  error?: Error
  reset?: () => void
  statusCode?: number
  title?: string
}

export default function ErrorPage({ 
  message = "An error occurred", 
  error, 
  reset, 
  statusCode = 500, 
  title = "Error" 
}: ErrorPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-red-500">{title}</h1>
        <p className="text-neutral/70">{message}</p>
        <div className="flex justify-center space-x-2">
          {reset && (
            <Button 
              variant="outline" 
              onClick={reset}
              className="mt-4"
            >
              Try Again
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
} 