// components/BlogFeed.tsx
'use client'

import { useBlogPosts } from '@/hooks/useBlogPosts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Rss } from 'lucide-react'

export function BlogFeed() {
  const { posts, isLoading, isError } = useBlogPosts()

  if (isError) {
    return (
      <Card className="bg-card/50 border-red-500">
        <CardHeader className="flex items-center space-x-2">
          <Rss className="text-red-500 w-5 h-5" />
          <CardTitle className="text-red-500">Latest Blog</CardTitle>
        </CardHeader>
        <CardContent className="text-red-400">Failed to load posts.</CardContent>
      </Card>
    )
  }

  if (isLoading || !posts) {
    return (
      <Card className="bg-card/50">
        <CardHeader className="flex items-center space-x-2">
          <Rss className="text-mint w-5 h-5 animate-pulse" />
          <CardTitle className="animate-pulse text-neutral/50">Loading…</CardTitle>
        </CardHeader>
        <CardContent className="text-neutral/50">Please wait</CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
      <CardHeader className="flex items-center space-x-2 pb-3">
        <Rss className="text-mint w-5 h-5" />
        <CardTitle>Latest Blog</CardTitle>
      </CardHeader>

      <CardContent 
        className="max-h-[360px] overflow-y-auto pr-2
                   scrollbar-thin scrollbar-track-transparent
                   scrollbar-thumb-amber/50 hover:scrollbar-thumb-amber/70"
      >
        {posts.slice(0, 10).map((post, i) => (
          <div key={i} className="py-3 last:pb-0">
            <Link
              href={post.link}
              target="_blank"
              className="block hover:bg-white/5 p-2 rounded-md transition"
            >
              <h4 className="font-medium text-mint">{post.title}</h4>
              <p className="mt-1 text-xs text-neutral/60">
                {new Date(post.pubDate).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </Link>
            {i < 9 && <Separator className="border-neutral/20" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
