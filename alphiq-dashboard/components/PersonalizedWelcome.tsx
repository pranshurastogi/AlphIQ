'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@alephium/web3-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useANS } from '@/hooks/useANS'
import { useUserData } from '@/hooks/useUserData'
import { useUserStreak } from '@/hooks/useUserStreak'
import { 
  Sparkles, 
  Trophy, 
  Zap, 
  TrendingUp, 
  Star,
  Quote
} from 'lucide-react'

interface PersonalizedWelcomeProps {
  className?: string
}

// Rotating typewriter effect component
function TypewriterText({ welcomeMessages }: { welcomeMessages: Array<{text: string, lang: string}> }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  const currentMessage = welcomeMessages[currentMessageIndex]

  useEffect(() => {
    if (isTyping && currentIndex < currentMessage.text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + currentMessage.text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 100) // Typing speed
      
      return () => clearTimeout(timeout)
    } else if (isTyping && currentIndex >= currentMessage.text.length) {
      // Finished typing, wait 1 second then start erasing
      const timeout = setTimeout(() => {
        setIsTyping(false)
      }, 1000)
      
      return () => clearTimeout(timeout)
    } else if (!isTyping && currentIndex > 0) {
      // Erasing
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev.slice(0, -1))
        setCurrentIndex(prev => prev - 1)
      }, 50) // Erasing speed (faster than typing)
      
      return () => clearTimeout(timeout)
    } else if (!isTyping && currentIndex === 0) {
      // Finished erasing, move to next message
      setCurrentMessageIndex(prev => (prev + 1) % welcomeMessages.length)
      setIsTyping(true)
    }
  }, [currentIndex, currentMessage.text, isTyping, welcomeMessages.length])

  return (
    <span className="inline-block">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

// Comprehensive quote library with time-based categories
const motivationalQuotes = {
  morning: [
    "Rise and shine, blockchain pioneer! Your onchain journey begins with a single transaction! 🌅",
    "Good morning! Every new day is a chance to strengthen your digital identity! ☀️",
    "Start your day with purpose - your blockchain reputation grows with each interaction! 🌄",
    "Morning motivation: Your onchain score reflects your dedication to the decentralized future! 🌞",
    "Good morning, crypto champion! Today's transactions build tomorrow's opportunities! 🌅",
    "Rise with the sun, build with the blockchain! Your digital identity awaits! 🌄",
    "Morning energy: Every ALPH you hold represents trust in the ecosystem! ☀️",
    "Start strong! Your consistency today shapes your onchain success tomorrow! 🌅",
    "Good morning, future-focused! The decentralized world needs your participation! 🌞",
    "Rise and grind, blockchain builder! Your reputation grows with every interaction! 🌄"
  ],
  afternoon: [
    "Afternoon power! Your onchain journey continues with momentum! 🌤️",
    "Midday motivation: Every transaction strengthens your digital identity! ☀️",
    "Afternoon energy: Building your reputation, one block at a time! 🌤️",
    "Keep the momentum going! Your onchain score reflects your commitment! ☀️",
    "Afternoon drive: The future is decentralized, and you're part of it! 🌤️",
    "Midday magic: Your activity today shapes tomorrow's opportunities! ☀️",
    "Afternoon focus: Consistency is the key to onchain success! 🌤️",
    "Keep building! Every interaction strengthens your blockchain reputation! ☀️",
    "Afternoon ambition: Your digital identity grows stronger with each transaction! 🌤️",
    "Midday momentum: The blockchain ecosystem thrives with your participation! ☀️"
  ],
  evening: [
    "Evening reflection: Your onchain journey has been remarkable today! 🌙",
    "Sunset success: Your digital identity grows stronger with each interaction! 🌆",
    "Evening energy: Building your reputation, one block at a time! 🌙",
    "Night vision: The future is decentralized, and you're leading the way! 🌆",
    "Evening excellence: Your onchain score reflects your dedication! 🌙",
    "Sunset strength: Every ALPH you hold represents trust in the ecosystem! 🌆",
    "Evening empowerment: Your activity today shapes tomorrow's opportunities! 🌙",
    "Night navigation: Consistency is the key to onchain success! 🌆",
    "Evening evolution: Your blockchain reputation grows with every interaction! 🌙",
    "Sunset success: The decentralized world is better with your participation! 🌆"
  ],
  night: [
    "Night owl power! Your onchain journey continues under the stars! 🌃",
    "Midnight motivation: Every transaction strengthens your digital identity! 🌙",
    "Night energy: Building your reputation, one block at a time! 🌃",
    "Late night legend: The future is decentralized, and you're part of it! 🌙",
    "Night vision: Your onchain score reflects your commitment to innovation! 🌃",
    "Midnight magic: Every ALPH you hold represents trust in the ecosystem! 🌙",
    "Night navigation: Your activity today shapes tomorrow's opportunities! 🌃",
    "Late night learning: Consistency is the key to onchain success! 🌙",
    "Night owl excellence: Your digital identity grows stronger with each interaction! 🌃",
    "Midnight momentum: The blockchain ecosystem thrives with your participation! 🌙"
  ]
}

export function PersonalizedWelcome({ className = '' }: PersonalizedWelcomeProps) {
  const { account } = useWallet()
  const address = typeof account === 'string' ? account : account?.address
  const { profile, hasProfile } = useUserProfile(address)
  const { ansName, hasANS } = useANS(address)
  const { userData, isLoading: userDataLoading } = useUserData(address)
  const { streak, isLoading: streakLoading } = useUserStreak(address)

  if (!address) {
    return null
  }

  const getDisplayName = () => {
    if (profile?.username) return profile.username
    if (hasANS && ansName) return ansName
    return 'Anonymous User'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getTimeBasedQuote = () => {
    const hour = new Date().getHours()
    let timeCategory: keyof typeof motivationalQuotes
    
    if (hour >= 5 && hour < 12) {
      timeCategory = 'morning'
    } else if (hour >= 12 && hour < 17) {
      timeCategory = 'afternoon'
    } else if (hour >= 17 && hour < 22) {
      timeCategory = 'evening'
    } else {
      timeCategory = 'night'
    }
    
    const quotes = motivationalQuotes[timeCategory]
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  // Typewriter effect for "Welcome Back" in multiple languages
  const welcomeMessages = [
    { text: "Welcome Back", lang: "English" },
    { text: "Bienvenido de Nuevo", lang: "Spanish" },
    { text: "Bienvenue à Nouveau", lang: "French" },
    { text: "Willkommen Zurück", lang: "German" },
    { text: "Benvenuto di Nuovo", lang: "Italian" },
    { text: "Bem-vindo de Volta", lang: "Portuguese" },
    { text: "欢迎回来", lang: "Chinese" },
    { text: "おかえりなさい", lang: "Japanese" },
    { text: "مرحباً بعودتك", lang: "Arabic" },
    { text: "Добро пожаловать обратно", lang: "Russian" },
    { text: "वापस स्वागत है", lang: "Hindi" }
  ]

  // Remove the getRandomWelcomeMessage function since we'll pass all messages to TypewriterText

  const hasCustomProfile = hasProfile && profile?.username

  // Only show welcome modal for users with usernames
  if (!hasCustomProfile) {
    return null
  }

  return (
    <>
      <style jsx>{`
        .spaceship-icon {
          position: relative;
          width: 40px;
          height: 40px;
          animation: float 3s ease-in-out infinite;
        }
        
        .spaceship-body {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 30px;
          background: linear-gradient(45deg, #ff8a65, #ffab91);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          box-shadow: 0 0 10px rgba(255, 138, 101, 0.5);
        }
        
        .spaceship-wings {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 8px;
          background: linear-gradient(90deg, #ff8a65, #ffab91);
          border-radius: 50%;
          opacity: 0.8;
        }
        
        .spaceship-engine {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 8px;
          background: linear-gradient(to bottom, #ff8a65, #ff5722);
          border-radius: 50%;
          animation: engine-glow 1s ease-in-out infinite alternate;
        }
        
        .spaceship-bg {
          background: radial-gradient(circle at 20% 50%, rgba(255, 138, 101, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 50%, rgba(255, 138, 101, 0.1) 0%, transparent 50%);
          animation: space-drift 10s linear infinite;
        }
        
        .score-display {
          animation: score-glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes engine-glow {
          0% { box-shadow: 0 0 5px #ff5722; }
          100% { box-shadow: 0 0 15px #ff5722, 0 0 25px #ff5722; }
        }
        
        @keyframes space-drift {
          0% { transform: translateX(-100px); }
          100% { transform: translateX(100px); }
        }
        
        @keyframes score-glow {
          0% { text-shadow: 0 0 5px rgba(255, 138, 101, 0.5); }
          100% { text-shadow: 0 0 20px rgba(255, 138, 101, 0.8), 0 0 30px rgba(255, 138, 101, 0.6); }
        }
      `}</style>
      <Card className={`glass-effect border-amber/30 hover:border-amber/50 transition-all duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-amber flex items-center">
          <Sparkles className="w-5 h-5 mr-2" />
          <TypewriterText welcomeMessages={welcomeMessages} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Personalized Greeting */}
        <div className="flex items-center space-x-3">
          {profile?.emoji && (
            <span className="text-3xl">{profile.emoji}</span>
          )}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-neutral">
              {getGreeting()}, {getDisplayName()}!
            </h3>
            <p className="text-sm text-neutral/70 mt-1">
              {getTimeBasedQuote()}
            </p>
          </div>
        </div>

        {/* Profile Status */}
        <div className="flex items-center space-x-2">
          {hasANS && (
            <Badge className="bg-mint/20 text-mint border-mint/30">
              <Trophy className="w-3 h-3 mr-1" />
              ANS Connected
            </Badge>
          )}
        </div>


        {/* Score & XP Display - Single Row */}
        <div className="flex items-center justify-between p-4 glass-card rounded-lg border-amber/20">
          {/* Onchain Score */}
          <div className="flex items-center space-x-3">
            <div className="spaceship-icon">
              <div className="spaceship-body"></div>
              <div className="spaceship-wings"></div>
              <div className="spaceship-engine"></div>
            </div>
            <div>
              <div className="text-xs text-neutral/60">Onchain Score</div>
              <div className="text-lg font-bold text-amber">
                {userDataLoading ? '...' : (userData?.score || 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-amber/30"></div>

          {/* Total XP */}
          <div className="flex items-center space-x-3">
            <Zap className="w-5 h-5 text-mint" />
            <div>
              <div className="text-xs text-neutral/60">Total XP</div>
              <div className="text-lg font-bold text-mint">
                {userDataLoading ? '...' : (userData?.admin_total_xp || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Streak Display */}
        {streak && streak.current_streak > 0 && (
          <div className="flex items-center justify-center space-x-2 text-xs text-neutral/60">
            <div className="w-1 h-1 bg-lavender rounded-full animate-pulse"></div>
            <span>
              {streak.current_streak === 1 ? "Welcome back! 🌟" :
               streak.current_streak < 7 ? `${streak.current_streak} days strong! 💪` :
               streak.current_streak < 30 ? `Amazing ${streak.current_streak} day streak! 🚀` :
               streak.current_streak < 100 ? `Incredible ${streak.current_streak} days! 🏆` :
               `Legendary ${streak.current_streak} days! 👑`}
            </span>
          </div>
        )}

        {/* Motivational Quote */}
        <div className="p-3 glass-card rounded-lg border-lavender/20">
          <div className="flex items-start space-x-2">
            <Quote className="w-4 h-4 text-lavender mt-0.5 flex-shrink-0" />
            <p className="text-sm text-neutral/80 italic">
              "The best way to predict the future is to create it. Your onchain journey is just beginning!"
            </p>
          </div>
        </div>

      </CardContent>
    </Card>
    </>
  )
}
