# XP Leaderboard Components

This document describes the new XP Leaderboard system that replaces the "Next Level Progress" section in the onchain-score page.

## Overview

The XP Leaderboard is a modular component system that displays the top 10 users by XP, with month-wise filtering and smooth animations. It showcases user rankings, levels, and XP totals with a focus on the top 3 performers.

## Components

### 1. XPLeaderboard (Main Component)
- **File**: `components/XPLeaderboard.tsx`
- **Purpose**: Main container component that orchestrates the entire leaderboard
- **Features**: 
  - Month-wise filtering (All Time, January-December)
  - Top 10 users display
  - Loading states and error handling
  - Responsive design

### 2. XPLeaderboardItem
- **File**: `components/XPLeaderboardItem.tsx`
- **Purpose**: Individual user row in the leaderboard
- **Features**:
  - Rank icons (Trophy for 1st, Medal for 2nd, Star for 3rd)
  - User title and address display
  - Level badges with custom colors
  - XP totals with formatting
  - Hover effects and animations

### 3. XPLeaderboardSkeleton
- **File**: `components/XPLeaderboardSkeleton.tsx`
- **Purpose**: Loading state placeholder
- **Features**: Animated skeleton loading with proper spacing

### 4. XPLeaderboardError
- **File**: `components/XPLeaderboardError.tsx`
- **Purpose**: Error state display with retry functionality
- **Features**: Error message display and retry button

## Hooks

### useXPLeaderboard
- **File**: `hooks/useXPLeaderboard.ts`
- **Purpose**: Custom hook for managing leaderboard data and state
- **Features**:
  - Data fetching from Supabase
  - Month filtering logic
  - XP level calculations
  - Error handling and loading states

## Database Schema

The components work with the following database tables:

### users
```sql
create table public.users (
  id uuid not null default gen_random_uuid (),
  address text not null,
  title text not null default ''::text,
  score integer not null default 0,
  exists_flag boolean not null default true,
  checked_at timestamp with time zone null,
  joined_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  admin_total_xp integer not null default 0,
  constraint users_pkey primary key (id),
  constraint users_address_key unique (address)
);
```

### admin_user_xp_history
```sql
create table public.admin_user_xp_history (
  id serial not null,
  user_address text not null,
  change integer not null,
  reason text not null,
  submission_id integer null,
  created_at timestamp with time zone not null default now(),
  constraint admin_user_xp_history_pkey primary key (id),
  constraint admin_user_xp_history_submission_id_fkey foreign KEY (submission_id) references admin_quest_submissions (id),
  constraint admin_user_xp_history_user_address_fkey foreign KEY (user_address) references users (address) on delete CASCADE
);
```

### admin_xp_levels
```sql
create table public.admin_xp_levels (
  level integer not null,
  name text not null,
  xp_min integer not null,
  xp_max integer not null,
  color_hex text not null,
  constraint admin_xp_levels_pkey primary key (level)
);
```

## Usage

### Basic Implementation
```tsx
import { XPLeaderboard } from '@/components/XPLeaderboard'

function MyPage() {
  return (
    <div>
      <XPLeaderboard />
    </div>
  )
}
```

### With Custom Hook
```tsx
import { useXPLeaderboard } from '@/hooks/useXPLeaderboard'

function MyComponent() {
  const { users, isLoading, error, selectedMonth, setSelectedMonth } = useXPLeaderboard()
  
  // Custom logic here
}
```

## Features

### Month Filtering
- **All Time**: Shows top 10 users by total XP
- **Monthly**: Shows users who gained XP in the selected month
- **Dynamic**: Automatically updates based on current year

### Level System
- Uses `admin_xp_levels` table for level information
- Displays level names and colors
- Calculates user levels based on total XP

### Animations
- **Framer Motion**: Smooth entrance animations for each user row
- **Staggered**: Each row animates in with a slight delay
- **Hover Effects**: Interactive hover states for better UX

### Responsive Design
- Works on all screen sizes
- Mobile-friendly layout
- Proper spacing and typography

## Styling

The components use the existing design system:
- **Colors**: Follows the established color palette (lavender, mint, amber)
- **Cards**: Consistent with other components in the app
- **Typography**: Matches the overall design language
- **Spacing**: Uses consistent spacing values

## Error Handling

- **Network Errors**: Graceful fallback with retry functionality
- **Data Errors**: User-friendly error messages
- **Loading States**: Proper skeleton loading for better UX
- **Empty States**: Handles cases with no data

## Performance

- **Efficient Queries**: Optimized Supabase queries
- **Memoization**: Uses useCallback for expensive operations
- **Lazy Loading**: Only fetches data when needed
- **Caching**: Leverages React's built-in caching mechanisms

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live leaderboard
- **Pagination**: Support for viewing more than top 10 users
- **Search**: User search functionality
- **Export**: Data export capabilities
- **Analytics**: User engagement metrics

## Dependencies

- **framer-motion**: For animations
- **@supabase/supabase-js**: For database operations
- **lucide-react**: For icons
- **@/components/ui**: For UI components

## Installation

The framer-motion dependency has been added to the project:
```bash
npm install framer-motion --legacy-peer-deps
```

## Testing

The components have been tested with:
- TypeScript compilation
- Next.js build process
- Component rendering
- Error states
- Loading states

## Migration

The XP Leaderboard replaces the "Next Level Progress" section in `app/onchain-score/page.tsx`. The old section has been completely removed and replaced with the new `<XPLeaderboard />` component.
