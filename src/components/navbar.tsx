"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Dice5, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
              <Dice5 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-700 to-indigo-700 bg-clip-text text-transparent">
              BoardCraft
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/#how-it-works"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Pricing
            </Link>
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Dashboard
                </Link>
                <Link href="/create">
                  <Button size="sm" className="ml-2">
                    Create Game
                  </Button>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="ml-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => signIn()}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Sign In
                </button>
                <Link href="/create">
                  <Button size="sm" className="ml-2">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden pb-4 space-y-2"
          >
            <Link href="/#how-it-works" className="block px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
              How It Works
            </Link>
            <Link href="/#pricing" className="block px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
              Pricing
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                  Dashboard
                </Link>
                <Link href="/create" className="block">
                  <Button size="sm" className="w-full">Create Game</Button>
                </Link>
              </>
            ) : (
              <>
                <button onClick={() => signIn()} className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100">
                  Sign In
                </button>
                <Link href="/create" className="block">
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
