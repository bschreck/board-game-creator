"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Dice5,
  Sparkles,
  Upload,
  Palette,
  Truck,
  ArrowRight,
  Check,
  Star,
  Shuffle,
  Gift,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PRICING } from "@/lib/pricing";
import { BASE_GAMES } from "@/lib/game-data";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-28 lg:pt-32 lg:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 px-4 py-1.5 text-sm" variant="default">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              AI-Powered Board Game Creator
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Turn Your Memories Into{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Epic Board Games
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Upload your photos, pick a classic game, add wild rule twists, and
              let AI create a stunning custom board game. Printed and shipped to
              your door.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create">
                <Button size="xl" className="group">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="xl">
                  See How It Works
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                No design skills needed
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Ships in 5-7 days
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-500" />
                Starting at $29
              </div>
            </div>
          </motion.div>

          {/* Hero preview cards */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            {[
              {
                title: "Family Vacation Monopoly",
                theme: "Beach House Edition",
                gradient: "from-amber-400 to-orange-500",
                icon: "🏖️",
              },
              {
                title: "Office Mystery Clue",
                theme: "Who Stole the Stapler?",
                gradient: "from-violet-500 to-purple-600",
                icon: "🔍",
              },
              {
                title: "Zombie Risk",
                theme: "Apocalypse Team Edition",
                gradient: "from-emerald-500 to-teal-600",
                icon: "🧟",
              },
            ].map((game, i) => (
              <Card
                key={i}
                className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div
                  className={`h-36 bg-gradient-to-br ${game.gradient} flex items-center justify-center`}
                >
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                    {game.icon}
                  </span>
                </div>
                <CardContent className="pt-4">
                  <p className="font-bold text-gray-900">{game.title}</p>
                  <p className="text-sm text-gray-500">{game.theme}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Base Games */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Dice5 className="h-3.5 w-3.5 mr-1.5" />
              Choose Your Base
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Start With a Classic, Make It Yours
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Pick from beloved board games as your foundation, then transform
              them into something uniquely yours.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {BASE_GAMES.map((game) => (
              <motion.div key={game.id} variants={fadeUp}>
                <Card className="group hover:shadow-lg hover:border-violet-200 transition-all duration-300 h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl group-hover:scale-110 transition-transform">
                        {game.icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">
                            {game.name}
                          </h3>
                          <Badge variant="secondary" className="text-[10px]">
                            {game.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">
                          {game.description}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-400">
                          <span>{game.playerCount} players</span>
                          <span>{game.duration}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Simple Process
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              From Idea to Doorstep in 4 Steps
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {[
              {
                icon: Dice5,
                title: "Pick a Game",
                description:
                  "Choose from Monopoly, Clue, Risk, Scrabble, and more as your starting point.",
                color: "from-violet-500 to-indigo-500",
              },
              {
                icon: Shuffle,
                title: "Customize Rules",
                description:
                  'Shake things up! Accept or reject AI-suggested rule mutations for unique gameplay.',
                color: "from-pink-500 to-rose-500",
              },
              {
                icon: Upload,
                title: "Add Photos & Theme",
                description:
                  "Upload photos of friends and family. Set a hilarious or meaningful theme.",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: Truck,
                title: "Print & Ship",
                description:
                  "AI generates your board, cards, and rules. We print and ship it to your door.",
                color: "from-emerald-500 to-teal-500",
              },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp}>
                <div className="relative text-center group">
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} shadow-lg mb-5 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -left-2 h-8 w-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-sm font-bold text-gray-400">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Powered by AI
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Not Your Average Board Game
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Every element is personalized — from the board art to the rule
              book to the game pieces.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Shuffle,
                title: "Rule Randomizer",
                description:
                  "Hit \"Shake It Up\" and get wild rule twists that make your game one-of-a-kind. Keep what\'s fun, ditch what\'s not.",
                gradient: "from-pink-500/10 to-rose-500/10",
                iconColor: "text-pink-600",
              },
              {
                icon: Palette,
                title: "AI Board Design",
                description:
                  "Our AI generates stunning board layouts, card designs, and artwork based on your theme and photos.",
                gradient: "from-violet-500/10 to-indigo-500/10",
                iconColor: "text-violet-600",
              },
              {
                icon: Gift,
                title: "Gift Mode",
                description:
                  "Ship to multiple addresses. Perfect for holidays, birthdays, or just because. Gift wrapping available on Deluxe.",
                gradient: "from-emerald-500/10 to-teal-500/10",
                iconColor: "text-emerald-600",
              },
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                  <CardContent className="pt-8 pb-8">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-4`}
                    >
                      <feature.icon
                        className={`h-6 w-6 ${feature.iconColor}`}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Choose Your Game Package
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Every package includes a complete, professionally printed board
              game.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {(
              Object.entries(PRICING) as [
                string,
                (typeof PRICING)[keyof typeof PRICING],
              ][]
            ).map(([key, tier], i) => (
              <motion.div key={key} variants={fadeUp}>
                <Card
                  className={`relative h-full ${
                    i === 1
                      ? "border-2 border-violet-500 shadow-xl shadow-violet-500/10 scale-[1.02]"
                      : "hover:shadow-lg"
                  } transition-all duration-300`}
                >
                  {i === 1 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="pt-8 pb-8">
                    <h3 className="text-lg font-bold text-gray-900">
                      {tier.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                      {tier.description}
                    </p>
                    <div className="mb-6">
                      <span className="text-4xl font-extrabold text-gray-900">
                        {tier.display}
                      </span>
                      <span className="text-gray-500 text-sm ml-1">
                        / game
                      </span>
                    </div>
                    <Link href="/create">
                      <Button
                        variant={i === 1 ? "default" : "outline"}
                        className="w-full mb-6"
                      >
                        Create Your Game
                      </Button>
                    </Link>
                    <ul className="space-y-3">
                      {tier.features.map((feature, j) => (
                        <li
                          key={j}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <Check className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            {...fadeUp}
            viewport={{ once: true }}
            whileInView="animate"
            initial="initial"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              Ready to Create Something
              <br />
              Unforgettable?
            </h2>
            <p className="mt-6 text-lg text-violet-100 max-w-2xl mx-auto">
              Design a board game your friends and family will talk about for
              years. It only takes a few minutes.
            </p>
            <div className="mt-10">
              <Link href="/create">
                <Button
                  size="xl"
                  className="bg-white text-violet-700 hover:bg-violet-50 shadow-xl hover:shadow-2xl group"
                >
                  Start Creating Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
