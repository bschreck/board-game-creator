"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Package,
  Mail,
  ArrowRight,
  Loader2,
  PartyPopper,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100 mb-8"
        >
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <PartyPopper className="h-6 w-6 text-amber-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Order Confirmed!
            </h1>
            <PartyPopper className="h-6 w-6 text-amber-500 scale-x-[-1]" />
          </div>

          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Your custom board game is being created. We&apos;ll email you updates
            as it moves through production.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-4 mb-10"
        >
          <Card>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 mb-3">
                    <Package className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Production
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Your game is being crafted with premium materials
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 mb-3">
                    <Mail className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Updates
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    We&apos;ll email you when it ships with tracking info
                  </p>
                </div>
                <div className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 mb-3">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Delivery
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Expected delivery in 5-7 business days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {sessionId && (
            <p className="text-xs text-gray-400">
              Order reference: {sessionId.slice(0, 20)}...
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              View My Orders
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/create">
            <Button variant="outline" size="lg">
              Create Another Game
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
