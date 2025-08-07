export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 text-red-500">⚠️</div>
        </div>
        <h1 className="text-2xl font-bold text-red-500">Page Not Found</h1>
        <p className="text-neutral/70">The page you're looking for doesn't exist.</p>
        <div className="flex justify-center space-x-2">
          <a 
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-4"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
} 