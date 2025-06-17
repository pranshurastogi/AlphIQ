// components/Footer.tsx
'use client'

import Link from 'next/link'
import { Twitter, Github, Mail, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-charcoal text-neutral py-8">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Social */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral/70 uppercase">Follow Us</h3>
          <div className="flex items-center space-x-4">
            <Link
              href="https://x.com/Alph_IQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-amber transition-colors"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-sm">@Alph_IQ</span>
            </Link>
            <Link
              href="https://github.com/pranshurastogi/AlphIQ"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-amber transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">GitHub</span>
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral/70 uppercase">Support</h3>
          <Link
            href="mailto:alphiqteam@gmail.com"
            className="flex items-center space-x-1 hover:text-amber transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span className="text-sm">alphiqteam@gmail.com</span>
          </Link>
        </div>

        {/* Credits */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral/70 uppercase">About</h3>
          <p className="text-sm leading-relaxed">
            Made with <Heart className="inline w-4 h-4 text-amber mx-[2px]" /> by{' '}
            <Link
              href="https://x.com/pranshurastogii"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber transition-colors font-medium"
            >
              @pranshurastogii
            </Link>
            .<br />
            Stay curious, stay on-chain!
          </p>
        </div>
      </div>

      {/* Fun tag */}
      <div className="mt-6 text-center text-xs text-neutral/50">
        P.S. No bots were harmed in the making of AlphIQ 🚀
      </div>

      {/* Copyright */}
      <div className="mt-2 text-center text-xs text-neutral/50">
        © {new Date().getFullYear()} AlphIQ. All rights reserved.
      </div>
    </footer>
  )
}
