import React from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorPageProps {
  message: string
}

export function ErrorPage({ message }: ErrorPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <AlertCircle className="w-16 h-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-neutral/70">{message}</p>
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    </div>
  )
} 