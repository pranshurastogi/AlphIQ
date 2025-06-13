// hooks/useBlogPosts.ts
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useBlogPosts() {
  const { data, error } = useSWR<{ posts: any[] }>('/api/blogs', fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60 * 60 * 1000 // 1h
  })

  return {
    posts: data?.posts,
    isLoading: !error && !data,
    isError: !!error
  }
}
